import { useState, useRef, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Scan, RefreshCw, Loader2, AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FoodAnalysisCard, { AnalysisResult } from "@/components/FoodAnalysisCard";

type ScannerState = "idle" | "camera" | "captured" | "loading" | "result" | "error";

const Scanner = () => {
  const [state, setState] = useState<ScannerState>("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

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
      setAnalysisResult(data);
      setState("result");
      toast.success("¡Análisis completado!");
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
    stopCamera();
    setAnalysisResult(null);
    setCapturedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setState("idle");
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Escanear Comida</h1>
          <p className="text-muted-foreground text-lg">
            Toma una foto de tu comida para obtener un análisis nutricional
          </p>
        </div>

        <Card className="aspect-square bg-muted rounded-3xl flex items-center justify-center overflow-hidden relative">
          {state === "idle" && (
            <div className="text-center space-y-4 p-4">
              <div className="flex items-center justify-center gap-8 text-muted-foreground">
                <Camera className="w-20 h-20" />
                <Upload className="w-20 h-20" />
              </div>
              <p className="text-lg text-muted-foreground">Usa tu cámara o sube una foto</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={startCamera} size="lg"><Camera className="mr-2 w-5 h-5" /> Activar Cámara</Button>
                <Button onClick={handleUploadClick} size="lg" variant="outline"><Upload className="mr-2 w-5 h-5" /> Subir Foto</Button>
              </div>
            </div>
          )}
          {(state === "camera" || state === "captured") && (
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${state === 'camera' ? 'block' : 'hidden'}`} />
          )}
          {state === "captured" && capturedImage && (
            <img src={capturedImage} alt="Captured food" className="w-full h-full object-cover" />
          )}
          {state === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-primary-foreground text-lg">Analizando...</p>
            </div>
          )}
          {state === "result" && analysisResult && (
             <div className="w-full h-full p-4 bg-background flex items-center justify-center">
                <img src={capturedImage!} alt="Analyzed food" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                <div className="relative z-10 w-full">
                    <FoodAnalysisCard result={analysisResult} />
                </div>
             </div>
          )}
          {state === "error" && (
            <div className="text-center space-y-4 p-4">
              <AlertTriangle className="w-24 h-24 text-destructive mx-auto" />
              <p className="text-destructive-foreground font-semibold">{error}</p>
            </div>
          )}
        </Card>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="space-y-3">
          {state === "camera" && <Button onClick={handleCapture} size="lg" className="w-full h-16 text-lg rounded-2xl"><Camera className="mr-2 w-6 h-6" /> Tomar Foto</Button>}
          {state === "captured" && (
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleReset} variant="outline" size="lg" className="h-16 text-lg rounded-2xl"><RefreshCw className="mr-2 w-6 h-6" /> Repetir</Button>
              <Button onClick={handleAnalyze} size="lg" className="h-16 text-lg rounded-2xl"><Scan className="mr-2 w-6 h-6" /> Analizar</Button>
            </div>
          )}
          {(state === "result" || state === "error") && <Button onClick={handleReset} size="lg" className="w-full h-16 text-lg rounded-2xl"><RefreshCw className="mr-2 w-6 h-6" /> Escanear de Nuevo</Button>}
        </div>
      </div>
    </PageLayout>
  );
};

export default Scanner;