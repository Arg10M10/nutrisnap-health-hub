import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Scan,
  RefreshCw,
  Loader2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  ScanLine,
  HelpCircle,
  Zap,
  ZapOff,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import Viewfinder from "@/components/Viewfinder";
import { useAuth } from "@/context/AuthContext";
import { motion, Transition } from "framer-motion";
import { useAILimit } from "@/hooks/useAILimit";
import { BrowserMultiFormatReader } from '@zxing/browser';

type ScannerState = "initializing" | "camera" | "captured" | "loading" | "error";
type ScanMode = "food" | "barcode";

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
  const [state, setState] = useState<ScannerState>("initializing");
  const [scanMode, setScanMode] = useState<ScanMode>("food");
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
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);

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
    codeReader.reset();
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

  const handleBarcodeDetected = async (barcode: string) => {
    const toastId = toast.loading("Código detectado. Buscando producto...");
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.status === 0 || !data.product) {
        toast.error("Producto no encontrado", { id: toastId, description: "Este código de barras no está en la base de datos." });
        handleReset();
        return;
      }

      const { error: functionError } = await supabase.functions.invoke('process-openfoodfacts-data', {
        body: { product: data.product },
      });
      if (functionError) throw new Error(functionError.message);

      toast.success("¡Producto añadido!", { id: toastId, description: data.product.product_name });
      queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
      navigate('/');
    } catch (err) {
      console.error("Error processing barcode:", err);
      toast.error("Error al procesar el producto", { id: toastId, description: (err as Error).message });
      handleReset();
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
      toast.info('Análisis iniciado...', { description: 'Verás los resultados en la pantalla de inicio pronto.' });
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

    if (scanMode === 'food') {
      const canProceed = await checkLimit('food_scan', 4, 'daily');
      if (canProceed) {
        startAnalysisMutation.mutate(imageData);
      } else {
        setState("captured");
      }
    } else { // Barcode mode
      try {
        const result = await codeReader.decodeFromCanvas(canvas);
        handleBarcodeDetected(result.getText());
      } catch (err) {
        if (err && (err as Error).name === 'NotFoundException') {
          toast.error("No se encontró un código de barras.", { description: "Asegúrate de que esté bien enfocado y visible." });
        } else {
          toast.error("Error al leer el código de barras.", { description: (err as Error).message });
        }
        handleReset();
      }
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
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      <div className="relative z-20 flex flex-col flex-1 pointer-events-none">
        <header className="flex justify-between items-center w-full p-4 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full bg-black/50 hover:bg-black/70 w-12 h-12">
            <X className="w-7 h-7 text-white" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 w-12 h-12">
                <HelpCircle className="w-7 h-7 text-white" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cómo funciona el escáner?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3 pt-2">
                  <p><strong>Modo Comida:</strong> Centra tu plato y toma una foto. La IA la analizará.</p>
                  <p><strong>Modo Código:</strong> Captura una foto clara del código de barras para buscar el producto.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction>Entendido</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        <div className="flex-1 relative flex items-center justify-center">
          {state === 'camera' && <Viewfinder mode={scanMode} />}
          {(state === 'loading' || startAnalysisMutation.isPending) && (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-xl font-bold animate-pulse">Procesando...</p>
             </div>
          )}
        </div>

        <footer className="flex flex-col items-center gap-6 w-full p-4 pointer-events-auto">
          {state === 'captured' && !startAnalysisMutation.isPending ? (
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Button onClick={handleReset} variant="secondary" size="lg" className="h-16 text-lg rounded-2xl">
                <RefreshCw className="mr-2 w-6 h-6" /> Repetir
              </Button>
              <Button onClick={handleManualAnalyze} size="lg" className="h-16 text-lg rounded-2xl">
                <Scan className="mr-2 w-6 h-6" /> Reintentar
              </Button>
            </div>
          ) : state === 'camera' ? (
            <>
              <div className="flex items-center justify-center gap-4 w-full">
                <Button
                  onClick={() => setScanMode("food")}
                  variant="ghost"
                  className={cn("flex flex-col items-center justify-center gap-2 w-28 h-20 rounded-2xl text-white transition-colors", scanMode === "food" ? "bg-white/90 text-black" : "bg-black/50 hover:bg-black/70")}
                ><Scan className="w-8 h-8" /><span className="font-semibold">Comida</span></Button>
                <Button
                  onClick={() => setScanMode("barcode")}
                  variant="ghost"
                  className={cn("flex flex-col items-center justify-center gap-2 w-28 h-20 rounded-2xl text-white transition-colors", scanMode === "barcode" ? "bg-white/90 text-black" : "bg-black/50 hover:bg-black/70")}
                ><ScanLine className="w-8 h-8" /><span className="font-semibold">Código</span></Button>
              </div>
              <div className="flex items-center justify-around w-full max-w-md">
                <button
                  onClick={toggleFlash}
                  disabled={!hasFlash}
                  className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors disabled:opacity-50"
                  aria-label="Activar flash"
                >{isFlashOn ? <Zap className="w-8 h-8 text-yellow-300" /> : <ZapOff className="w-8 h-8 text-white" />}</button>
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full bg-white active:bg-gray-200 transition-all active:scale-95 border-4 border-transparent hover:border-gray-200"
                  aria-label="Tomar foto"
                />
                <button
                  onClick={handleUploadClick}
                  className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Subir imagen"
                ><ImageIcon className="w-8 h-8 text-white" /></button>
              </div>
            </>
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
  );
};

export default Scanner;