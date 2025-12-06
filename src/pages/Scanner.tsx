import { useState, useRef, useEffect, ComponentType } from "react";
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
  const [BarcodeScanner, setBarcodeScanner] = useState<ComponentType<any> | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkLimit, logUsage } = useAILimit();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
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

  useEffect(() => {
    if (scanMode === 'food') {
      startCamera();
    } else {
      stopCamera();
      setState('initializing');
      if (!BarcodeScanner) {
        import('react-zxing')
          .then((mod) => {
            const ScannerComponent = mod.BarcodeScanner;
            if (ScannerComponent) {
              setBarcodeScanner(() => ScannerComponent);
              setState('camera');
            } else {
              throw new Error("BarcodeScanner component not found in react-zxing module.");
            }
          })
          .catch(err => {
            console.error("Failed to load BarcodeScanner component", err);
            toast.error("No se pudo cargar el escáner de códigos de barras.");
            setError("Error al cargar el componente del escáner.");
            setState("error");
          });
      } else {
        setState('camera');
      }
    }
    return () => stopCamera();
  }, [scanMode]);

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

  const barcodeScanMutation = useMutation({
    mutationFn: async (barcode: string) => {
      if (!user) throw new Error('User not found');
      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          food_name: `Buscando: ${barcode}`,
          status: 'processing',
          barcode: barcode,
        })
        .select()
        .single();
      if (error) throw error;
      return { newEntry: data, barcode };
    },
    onSuccess: ({ newEntry, barcode }) => {
      queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
      navigate('/');
      toast.info('Buscando producto...', { description: 'Verás los resultados en la pantalla de inicio pronto.' });

      supabase.functions.invoke('process-barcode', {
        body: { entry_id: newEntry.id, barcode },
      }).then(({ error }) => {
        if (error) {
          console.error("Function invocation failed:", error);
          supabase.from('food_entries').update({ status: 'failed', reason: 'No se pudo iniciar la búsqueda.' }).eq('id', newEntry.id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
          });
        }
      });
    },
    onError: (err: Error) => {
      console.error("Barcode scan start error:", err);
      toast.error("No se pudo iniciar la búsqueda.", { description: err.message });
    },
  });

  const handleBarcodeScan = (result: unknown) => {
    if (barcodeScanMutation.isPending) return;

    if (result && typeof (result as any).getText === 'function') {
      const barcode = (result as any).getText();
      if (barcode) {
        barcodeScanMutation.mutate(barcode);
      }
    }
  };

  const startAnalysisMutation = useMutation({
    mutationFn: async (imageData: string) => {
      if (!user) throw new Error('User not found');
      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          food_name: 'Analizando...',
          image_url: imageData,
          status: 'processing',
        })
        .select()
        .single();
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
      setState("captured"); // Allow retry if failed
    },
  });

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const { videoWidth, videoHeight } = video;
      let width = videoWidth;
      let height = videoHeight;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, width, height);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      
      setCapturedImage(imageData);
      stopCamera();
      
      const canProceed = await checkLimit('food_scan', 4, 'daily');
      
      if (canProceed) {
        setState("loading");
        startAnalysisMutation.mutate(imageData);
      } else {
        setState("captured");
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
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
    if (scanMode === 'food') {
      startCamera();
    } else {
      setState('camera');
    }
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
        {scanMode === 'food' && (
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
        )}
        {scanMode === 'barcode' && state === 'camera' && BarcodeScanner && (
          <BarcodeScanner
            onResult={handleBarcodeScan}
            onError={(error) => {
              console.error("Barcode scanner error:", error);
              let message = "Ocurrió un error inesperado con el escáner.";
              if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                  message = "Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en la configuración de tu navegador.";
                } else if (error.name === 'NotFoundException' || error.name === 'NotFoundError') {
                  message = "No se encontró una cámara compatible. Asegúrate de que no esté siendo usada por otra aplicación.";
                } else {
                  message = "El escáner no pudo iniciarse. Intenta refrescar la página.";
                }
              }
              toast.error("Error del escáner", { description: message });
            }}
          />
        )}
        {capturedImage && (state === 'captured' || state === 'loading' || startAnalysisMutation.isPending) && (
          <img
            src={capturedImage}
            alt="Comida capturada"
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
                  <p>
                    <strong>Modo Comida:</strong> Centra tu plato y toma una foto. La IA comenzará a analizarla automáticamente.
                  </p>
                  <p>
                    <strong>Modo Código:</strong> Apunta al código de barras para buscar el producto.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction>Entendido</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        <div className="flex-1 relative flex items-center justify-center">
          {scanMode === 'food' && state === 'camera' && <Viewfinder />}
          {scanMode === 'barcode' && state === 'camera' && (
            <div className="w-[80vw] max-w-md h-24 bg-white/10 rounded-lg border-2 border-white/50 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
            </div>
          )}
          {(state === 'loading' || startAnalysisMutation.isPending) && (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-xl font-bold animate-pulse">Analizando imagen...</p>
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
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 w-28 h-20 rounded-2xl text-white transition-colors",
                    scanMode === "food"
                      ? "bg-white/90 text-black"
                      : "bg-black/50 hover:bg-black/70"
                  )}
                >
                  <Scan className="w-8 h-8" />
                  <span className="font-semibold">Comida</span>
                </Button>
                <Button
                  onClick={() => setScanMode("barcode")}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 w-28 h-20 rounded-2xl text-white transition-colors",
                    scanMode === "barcode"
                      ? "bg-white/90 text-black"
                      : "bg-black/50 hover:bg-black/70"
                  )}
                >
                  <ScanLine className="w-8 h-8" />
                  <span className="font-semibold">Código</span>
                </Button>
              </div>
              <div className="flex items-center justify-around w-full max-w-md">
                <button
                  onClick={toggleFlash}
                  disabled={!hasFlash}
                  className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors disabled:opacity-50"
                  aria-label="Activar flash"
                >
                  {isFlashOn ? <Zap className="w-8 h-8 text-yellow-300" /> : <ZapOff className="w-8 h-8 text-white" />}
                </button>
                {scanMode === 'food' ? (
                  <button
                    onClick={handleCapture}
                    className="w-20 h-20 rounded-full bg-white active:bg-gray-200 transition-all active:scale-95 border-4 border-transparent hover:border-gray-200"
                    aria-label="Tomar foto"
                  />
                ) : (
                  <div className="w-20 h-20" />
                )}
                <button
                  onClick={handleUploadClick}
                  className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Subir imagen"
                >
                  <ImageIcon className="w-8 h-8 text-white" />
                </button>
              </div>
            </>
          ) : null}
        </footer>
      </div>

      {state === "initializing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4 z-30">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-white text-lg">
            {scanMode === 'food' ? 'Iniciando cámara...' : 'Cargando escáner...'}
          </p>
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