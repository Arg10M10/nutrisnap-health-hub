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
  FlipHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult } from "@/components/FoodAnalysisCard";
import { cn } from "@/lib/utils";

type ScannerState = "camera" | "captured" | "loading" | "error";
type ScanMode = "food" | "barcode";

const Scanner = () => {
  const [state, setState] = useState<ScannerState>("camera");
  const [scanMode, setScanMode] = useState<ScanMode>("food");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setState("camera");
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
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
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
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setState("captured");
        toast.success("Imagen cargada con éxito.");
      };
      reader.onerror = () => {
        toast.error("No se pudo leer el archivo de imagen.");
        setError("No se pudo leer el archivo de imagen.");
        setState("error");
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
      navigate('/analysis-result', { state: { result: data, image: capturedImage } });
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
    startCamera();
  };

  const handleClose = () => navigate(-1);

  return (
    <div className="fixed inset-0 bg-black text-white z-50">
      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          state !== "camera" && "hidden"
        )}
      />
      {/* Captured Image Preview */}
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Comida capturada"
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            state !== "captured" && "hidden"
          )}
        />
      )}

      {/* Overlays for different states */}
      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-primary-foreground text-lg">Analizando...</p>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center space-y-6">
          <AlertTriangle className="w-24 h-24 text-destructive" />
          <p className="text-xl font-semibold">{error}</p>
          <Button onClick={handleReset} size="lg" className="w-full max-w-sm h-14 text-lg">
            <RefreshCw className="mr-2 w-6 h-6" /> Intentar de Nuevo
          </Button>
        </div>
      )}

      {/* UI Controls */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Bar */}
        <div className="flex justify-between items-center w-full pointer-events-auto">
          <div className="w-10"></div> {/* Spacer */}
          <h2 className="text-xl font-bold text-white drop-shadow-md">
            {state === 'captured' ? 'Confirmar Foto' : 'Escáner'}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full bg-black/50 hover:bg-black/70 w-10 h-10">
            <X className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Bottom Controls */}
        {state === "camera" && (
          <div className="flex flex-col items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setScanMode("food")}
                variant="ghost"
                className={cn(
                  "rounded-full px-6 h-12 text-base font-semibold transition-colors",
                  scanMode === "food"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black/40 text-white hover:bg-black/60"
                )}
              >
                Comida
              </Button>
              <Button
                onClick={() => toast.info("Próximamente", { description: "El escaneo de código de barras estará disponible pronto." })}
                variant="ghost"
                className="rounded-full px-6 h-12 text-base font-semibold bg-black/40 text-white/70 hover:bg-black/60"
              >
                Código de Barras
              </Button>
            </div>
            <div className="flex items-center justify-around w-full">
              <button
                onClick={handleUploadClick}
                className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                aria-label="Subir imagen"
              >
                <ImageIcon className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white bg-white active:bg-gray-200 transition-colors"
                aria-label="Tomar foto"
              />
              <button
                onClick={() => toast.info("Próximamente", { description: "La función para cambiar de cámara estará disponible pronto." })}
                className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                aria-label="Cambiar cámara"
              >
                <FlipHorizontal className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        )}

        {state === "captured" && (
          <div className="grid grid-cols-2 gap-4 pointer-events-auto">
            <Button onClick={handleReset} variant="secondary" size="lg" className="h-16 text-lg rounded-2xl">
              <RefreshCw className="mr-2 w-6 h-6" /> Repetir
            </Button>
            <Button onClick={handleAnalyze} size="lg" className="h-16 text-lg rounded-2xl">
              <Scan className="mr-2 w-6 h-6" /> Analizar
            </Button>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;