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
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult } from "@/components/FoodAnalysisCard";
import { cn } from "@/lib/utils";
import Viewfinder from "@/components/Viewfinder";
import { useNutrition } from "@/context/NutritionContext";
import AnalysisResultDrawer from "@/components/AnalysisResultDrawer";

type ScannerState = "initializing" | "camera" | "captured" | "loading" | "error";
type ScanMode = "food" | "barcode";

const MAX_DIMENSION = 1024; // Max width/height for the image

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
  const { addAnalysis } = useNutrition();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Lock body scroll when scanner is active
    document.body.style.overflow = 'hidden';
    // Restore body scroll on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      if (isFlashOn) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack && videoTrack.getCapabilities().torch) {
          videoTrack.applyConstraints({ advanced: [{ torch: false }] });
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
        if (videoTrack && videoTrack.getCapabilities().torch) {
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
        import('react-zxing').then(module => {
          setBarcodeScanner(() => module.BarcodeScanner);
          setState('camera');
        }).catch(err => {
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
        advanced: [{ torch: !isFlashOn }],
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error("Error toggling flash:", err);
      toast.error("No se pudo activar el flash.");
    }
  };

  const handleBarcodeScan = (result: any) => {
    if (result) {
      const barcode = result.getText();
      toast.success(`Código de barras detectado: ${barcode}`);
      navigate('/barcode-result', { state: { barcode } });
    }
  };

  const handleCapture = () => {
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
      setState("captured");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
          setState("captured");
          toast.success("Imagen cargada y optimizada.");
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageData },
      });
      if (error) throw new Error(error.message);
      return data as AnalysisResult;
    },
    onSuccess: (data) => {
      setState("captured");
      setAnalysisResult(data);
    },
    onError: (err) => {
      console.error("Analysis error:", err);
      setError("No se pudo analizar la imagen. Inténtalo de nuevo.");
      setState("error");
      toast.error("Error en el análisis", {
        description: "La IA no pudo procesar la imagen. Por favor, intenta con otra foto.",
      });
    },
  });

  const handleAnalyze = () => {
    if (capturedImage) {
      setState("loading");
      analyzeMutation.mutate(capturedImage);
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

  const handleSaveAnalysis = () => {
    if (analysisResult && capturedImage) {
      addAnalysis(analysisResult, capturedImage);
      setAnalysisResult(null);
      handleReset();
    }
  };

  const handleDrawerClose = () => {
    setAnalysisResult(null);
    handleReset();
  };

  const handleClose = () => navigate(-1);

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* BACKGROUND: Camera/Image View */}
      <div className="absolute inset-0 z-10">
        {scanMode === 'food' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onCanPlay={() => setState("camera")}
            className={cn(
              "w-full h-full object-cover",
              state === "captured" || state === 'error' ? "hidden" : "block"
            )}
          />
        )}
        {scanMode === 'barcode' && state === 'camera' && BarcodeScanner && (
          <BarcodeScanner
            onResult={handleBarcodeScan}
            onError={(error) => {
              console.error(error);
              toast.error("Error del escáner de códigos.");
            }}
          />
        )}
        {capturedImage && (state === 'captured' || state === 'loading') && (
          <img
            src={capturedImage}
            alt="Comida capturada"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* FOREGROUND: UI Controls and Viewfinder */}
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
                    <strong>Modo Comida:</strong> Centra tu plato en el recuadro y toma una foto. Nuestra IA analizará la imagen para darte una estimación de sus valores nutricionales.
                  </p>
                  <p>
                    <strong>Modo Código:</strong> Apunta la cámara al código de barras de un producto. Buscaremos en nuestra base de datos para darte su información nutricional exacta.
                  </p>
                  <p>
                    ¡También puedes subir una foto desde tu galería usando el icono de imagen!
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction>Entendido</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        <div className="flex-1 relative">
          {scanMode === 'food' && state === 'camera' && <Viewfinder />}
        </div>

        <footer className="flex flex-col items-center gap-6 w-full p-4 pointer-events-auto">
          {state === 'captured' ? (
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Button onClick={handleReset} variant="secondary" size="lg" className="h-16 text-lg rounded-2xl">
                <RefreshCw className="mr-2 w-6 h-6" /> Repetir
              </Button>
              <Button onClick={handleAnalyze} size="lg" className="h-16 text-lg rounded-2xl">
                <Scan className="mr-2 w-6 h-6" /> Analizar
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
                    className="w-20 h-20 rounded-full bg-white active:bg-gray-200 transition-colors"
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

      {/* STATE OVERLAYS */}
      {state === "initializing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4 z-30">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-white text-lg">
            {scanMode === 'food' ? 'Iniciando cámara...' : 'Cargando escáner...'}
          </p>
        </div>
      )}
      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4 z-30">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-white text-lg">Analizando...</p>
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

      <AnalysisResultDrawer
        isOpen={!!analysisResult}
        result={analysisResult}
        onClose={handleDrawerClose}
        onSave={handleSaveAnalysis}
      />

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;