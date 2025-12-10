import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Scan,
  RefreshCw,
  Loader2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  HelpCircle,
  Zap,
  ZapOff,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import Viewfinder from "@/components/Viewfinder";
import { useAuth } from "@/context/AuthContext";
import { motion, Transition } from "framer-motion";
import { useAILimit } from "@/hooks/useAILimit";
import InfoDrawer from "@/components/InfoDrawer";
import { useTranslation } from "react-i18next";

type ScannerState = "initializing" | "camera" | "captured" | "loading" | "error";

const MAX_DIMENSION = 1024;

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
};

const Scanner = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<ScannerState>("initializing");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkLimit, logUsage } = useAILimit();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    startCamera();
    return () => {
      document.body.style.overflow = 'auto';
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      if (isFlashOn) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack && (videoTrack.getCapabilities() as any).torch) {
          videoTrack.applyConstraints({ advanced: [{ torch: false } as any] });
        }
      }
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsFlashOn(false);
  };

  const startCamera = async () => {
    setState("initializing");
    setHasFlash(false);
    try {
      if (streamRef.current) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && (videoTrack.getCapabilities() as any).torch) {
          setHasFlash(true);
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("No se pudo acceder a la cámara.", {
        description: "Asegúrate de haber dado los permisos necesarios.",
      });
      setError("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
      setState("error");
    }
  };

  const toggleFlash = async () => {
    if (!hasFlash || !streamRef.current) {
      toast.info("Flash no disponible en este dispositivo.");
      return;
    }
    const videoTrack = streamRef.current.getVideoTracks()[0];
    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: !isFlashOn } as any],
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error("Error toggling flash:", err);
      toast.error("No se pudo activar el flash.");
    }
  };

  const startAnalysisMutation = useMutation({
    mutationFn: async (imageData: string) => {
      if (!user) throw new Error('User not found');
      const { data, error } = await supabase
        .from('food_entries')
        .insert({ user_id: user.id, food_name: 'Analizando...', image_url: imageData, status: 'processing' })
        .select().single();
      if (error) throw error;
      return { newEntry: data, imageData };
    },
    onSuccess: ({ newEntry, imageData }) => {
      logUsage('food_scan');
      queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
      navigate('/');
      supabase.functions.invoke("analyze-food", {
        body: { entry_id: newEntry.id, imageData: imageData },
      }).then(({ error }) => {
        if (error) {
          console.error("Function invocation failed:", error);
          supabase.from('food_entries').update({ status: 'failed', reason: 'Could not start analysis.' }).eq('id', newEntry.id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
          });
        }
      });
    },
    onError: (err: Error) => {
      console.error("Analysis start error:", err);
      toast.error("No se pudo iniciar el análisis.", { description: err.message });
      setState("captured");
    },
  });

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const { videoWidth, videoHeight } = video;
    let width = videoWidth;
    let height = videoHeight;

    if (width > height) {
      if (width > MAX_DIMENSION) { height *= MAX_DIMENSION / width; width = MAX_DIMENSION; }
    } else {
      if (height > MAX_DIMENSION) { width *= MAX_DIMENSION / height; height = MAX_DIMENSION; }
    }

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context?.drawImage(video, 0, 0, width, height);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    
    setCapturedImage(imageData);
    stopCamera();
    setState("loading");

    const canProceed = await checkLimit('food_scan', 4, 'daily');
    if (canProceed) {
      startAnalysisMutation.mutate(imageData);
    } else {
      setState("captured");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const canProceed = await checkLimit('food_scan', 4, 'daily');
      if (!canProceed) return;

      setState("loading");
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX_DIMENSION) { height *= MAX_DIMENSION / width; width = MAX_DIMENSION; }
          } else {
            if (height > MAX_DIMENSION) { width *= MAX_DIMENSION / height; height = MAX_DIMENSION; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const resizedImageData = canvas.toDataURL("image/jpeg", 0.8);
          
          setCapturedImage(resizedImageData);
          startAnalysisMutation.mutate(resizedImageData);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualAnalyze = async () => {
    if (capturedImage) {
      const canProceed = await checkLimit('food_scan', 4, 'daily');
      if (canProceed) {
        setState("loading");
        startAnalysisMutation.mutate(capturedImage);
      }
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    startCamera();
  };

  const handleClose = () => navigate(-1);

  return (
    <>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="fixed inset-0 bg-black text-white z-50 flex flex-col"
      >
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onCanPlay={() => setState("camera")}
            className={cn(
              "w-full h-full object-cover",
              state === "captured" || state === "loading" || state === 'error' ? "hidden" : "block"
            )}
          />
          {capturedImage && (state === 'captured' || state === 'loading' || startAnalysisMutation.isPending) && (
            <img
              src={capturedImage}
              alt="Captura de cámara"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="relative z-20 flex flex-col flex-1 pointer-events-none">
          <header className="flex justify-between items-center w-full p-4 pointer-events-auto">
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 w-12 h-12">
              <X className="w-7 h-7 text-white" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsInfoOpen(true)} className="rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 w-12 h-12">
              <HelpCircle className="w-7 h-7 text-white" />
            </Button>
          </header>

          <div className="flex-1 relative flex items-center justify-center">
            {state === 'camera' && <Viewfinder mode="food" />}
            {(state === 'loading' || startAnalysisMutation.isPending) && (
               <div className="flex flex-col items-center gap-4 bg-black/30 backdrop-blur-sm p-8 rounded-2xl">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <p className="text-xl font-bold animate-pulse">Procesando...</p>
               </div>
            )}
          </div>

          <footer className="flex flex-col items-center gap-6 w-full p-4 pointer-events-auto">
            {state === 'captured' && !startAnalysisMutation.isPending ? (
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <Button onClick={handleReset} variant="outline" size="lg" className="h-16 text-lg rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <RefreshCw className="mr-2 w-6 h-6" /> Repetir
                </Button>
                <Button onClick={handleManualAnalyze} size="lg" className="h-16 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Scan className="mr-2 w-6 h-6" /> Reintentar
                </Button>
              </div>
            ) : state === 'camera' ? (
              <div className="flex items-center justify-around w-full max-w-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFlash}
                  disabled={!hasFlash}
                  className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 disabled:opacity-50"
                  aria-label="Activar flash"
                >
                  {isFlashOn ? <Zap className="w-7 h-7 text-yellow-300" /> : <ZapOff className="w-7 h-7 text-white" />}
                </Button>
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full border-[6px] border-white bg-transparent transition-transform active:scale-95"
                  aria-label="Tomar foto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUploadClick}
                  className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
                  aria-label="Subir imagen"
                >
                  <ImageIcon className="w-7 h-7 text-white" />
                </Button>
              </div>
            ) : null}
          </footer>
        </div>

        {state === "initializing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4 z-30">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-white text-lg">Iniciando cámara...</p>
          </div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center space-y-6 z-30">
            <AlertTriangle className="w-24 h-24 text-destructive" />
            <p className="text-xl font-semibold">{error}</p>
            <Button onClick={handleReset} size="lg" className="w-full max-w-sm h-14 text-lg">
              <RefreshCw className="mr-2 w-6 h-6" /> Intentar de Nuevo
            </Button>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
      <InfoDrawer
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={t('scanner.help_title')}
        icon={<Scan className="w-8 h-8" />}
      >
        <p>
          {t('scanner.help_desc')}
        </p>
      </InfoDrawer>
    </>
  );
};

export default Scanner;