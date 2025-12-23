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

// Aumentamos un poco la dimensión máxima para que la IA tenga más detalle
const MAX_DIMENSION = 1280;

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
  const { t, i18n } = useTranslation();
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
      
      // SOLICITAMOS 4K: Al pedir una resolución ideal muy alta, 
      // el navegador/OS seleccionará automáticamente la mejor cámara trasera disponible.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 3840 }, 
          height: { ideal: 2160 } 
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Esperamos a que carguen los metadatos para saber si hay flash
        videoRef.current.onloadedmetadata = () => {
           const videoTrack = stream.getVideoTracks()[0];
           if (videoTrack && (videoTrack.getCapabilities() as any).torch) {
             setHasFlash(true);
           }
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error(t('scanner.error_camera_title'), {
        description: t('scanner.error_camera_desc'),
      });
      setError(t('scanner.error_camera_desc'));
      setState("error");
    }
  };

  const toggleFlash = async () => {
    if (!hasFlash || !streamRef.current) {
      toast.info(t('scanner.flash_unavailable'));
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
      toast.error("Error toggling flash.");
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
        body: { entry_id: newEntry.id, imageData: imageData, language: i18n.language },
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
      toast.error(t('scanner.error_analysis'), { description: t('common.error_friendly') });
      setState("captured");
    },
  });

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Usamos el tamaño real del video (que ahora será HD/4K)
    const { videoWidth, videoHeight } = video;
    let width = videoWidth;
    let height = videoHeight;

    // Redimensionamos solo si es excesivamente grande para la API, 
    // pero mantenemos buena calidad (1280px)
    if (width > height) {
      if (width > MAX_DIMENSION) { height *= MAX_DIMENSION / width; width = MAX_DIMENSION; }
    } else {
      if (height > MAX_DIMENSION) { width *= MAX_DIMENSION / height; height = MAX_DIMENSION; }
    }

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    
    // Image smoothing para mejor calidad al redimensionar
    if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(video, 0, 0, width, height);
    }
    
    const imageData = canvas.toDataURL("image/jpeg", 0.9); // Calidad 90%
    
    setCapturedImage(imageData);
    stopCamera();
    setState("loading");

    const { canProceed, limit } = await checkLimit('food_scan', 4, 'daily');
    if (canProceed) {
      startAnalysisMutation.mutate(imageData);
    } else {
      toast.error(t('common.ai_limit_reached'), {
        description: t('common.ai_limit_daily_desc', { limit }),
      });
      setState("captured");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const { canProceed, limit } = await checkLimit('food_scan', 4, 'daily');
      if (!canProceed) {
        toast.error(t('common.ai_limit_reached'), {
          description: t('common.ai_limit_daily_desc', { limit }),
        });
        return;
      }

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
          if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
          }
          const resizedImageData = canvas.toDataURL("image/jpeg", 0.9);
          
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
      const { canProceed, limit } = await checkLimit('food_scan', 4, 'daily');
      if (canProceed) {
        setState("loading");
        startAnalysisMutation.mutate(capturedImage);
      } else {
        toast.error(t('common.ai_limit_reached'), {
          description: t('common.ai_limit_daily_desc', { limit }),
        });
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
          <header className="flex justify-between items-center w-full p-4 pt-12 pointer-events-auto z-50 relative">
            <motion.button
              onClick={handleClose}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md shadow-lg border border-white/10"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-8 h-8 text-white" />
            </motion.button>
            <motion.button
              onClick={() => setIsInfoOpen(true)}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md shadow-lg border border-white/10"
              whileTap={{ scale: 0.9 }}
            >
              <HelpCircle className="w-8 h-8 text-white" />
            </motion.button>
          </header>

          <div className="flex-1 relative flex items-center justify-center">
            {state === 'camera' && <Viewfinder mode="food" />}
            {(state === 'loading' || startAnalysisMutation.isPending) && (
               <div className="flex flex-col items-center gap-4 bg-black/30 backdrop-blur-sm p-8 rounded-2xl z-50 relative">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <p className="text-xl font-bold animate-pulse">{t('scanner.processing')}</p>
               </div>
            )}
          </div>

          <footer className="flex flex-col items-center gap-6 w-full p-4 pb-16 pointer-events-auto z-50 relative">
            {state === 'captured' && !startAnalysisMutation.isPending ? (
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <Button onClick={handleReset} variant="outline" size="lg" className="h-16 text-lg rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <RefreshCw className="mr-2 w-6 h-6" /> {t('scanner.retake')}
                </Button>
                <Button onClick={handleManualAnalyze} size="lg" className="h-16 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Scan className="mr-2 w-6 h-6" /> {t('scanner.retry')}
                </Button>
              </div>
            ) : state === 'camera' ? (
              <div className="flex items-center justify-around w-full max-w-md">
                <motion.button
                  onClick={toggleFlash}
                  disabled={!hasFlash}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm disabled:opacity-50 border border-white/10"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Activar flash"
                >
                  {isFlashOn ? <Zap className="w-8 h-8 text-yellow-300" /> : <ZapOff className="w-8 h-8 text-white" />}
                </motion.button>
                
                <motion.button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent shadow-lg"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Tomar foto"
                >
                  <div className="w-16 h-16 rounded-full bg-white" />
                </motion.button>

                <motion.button
                  onClick={handleUploadClick}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Subir imagen"
                >
                  <ImageIcon className="w-8 h-8 text-white" />
                </motion.button>
              </div>
            ) : null}
          </footer>
        </div>

        {state === "initializing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4 z-30">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-white text-lg">{t('scanner.starting')}</p>
          </div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center space-y-6 z-30">
            <AlertTriangle className="w-24 h-24 text-destructive" />
            <p className="text-xl font-semibold">{error}</p>
            <Button onClick={handleReset} size="lg" className="w-full max-w-sm h-14 text-lg">
              <RefreshCw className="mr-2 w-6 h-6" /> {t('scanner.retry')}
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