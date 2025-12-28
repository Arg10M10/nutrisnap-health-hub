import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Info
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useLocalStorage from "@/hooks/useLocalStorage";
import MenuAnalysisDrawer, { MenuAnalysisData } from "@/components/MenuAnalysisDrawer";
import { FoodEntry } from "@/context/NutritionContext";

type ScannerState = "initializing" | "camera" | "captured" | "loading" | "error";

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
  const navigate = useNavigate();
  const location = useLocation();
  
  const scanMode = (location.state as { mode?: 'food' | 'menu' })?.mode || 'food';

  const [state, setState] = useState<ScannerState>("initializing");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { checkLimit, logUsage } = useAILimit();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useLocalStorage('scanner_disclaimer_v1', false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [menuData, setMenuData] = useState<MenuAnalysisData | null>(null);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const originalStyleRef = useRef<{ overflow: string, overscrollBehavior: string } | null>(null);

  useEffect(() => {
    originalStyleRef.current = {
      overflow: document.body.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior
    };

    if (!hasAcceptedDisclaimer) {
      setShowDisclaimer(true);
    } else {
      initScanner();
    }

    return () => {
      if (originalStyleRef.current) {
        document.body.style.overflow = originalStyleRef.current.overflow;
        document.body.style.overscrollBehavior = originalStyleRef.current.overscrollBehavior;
      } else {
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
      }
      stopCamera();
    };
  }, []);

  const initScanner = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    
    setTimeout(() => {
        startCamera();
    }, 300);
  };

  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    setShowDisclaimer(false);
    initScanner();
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open && !hasAcceptedDisclaimer) {
      navigate(-1);
    }
    setShowDisclaimer(open);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      if (isFlashOn) {
        try {
          const videoTrack = streamRef.current.getVideoTracks()[0];
          if (videoTrack && (videoTrack.getCapabilities() as any).torch) {
            videoTrack.applyConstraints({ advanced: [{ torch: false } as any] });
          }
        } catch (e) {
          console.error("Error stopping flash", e);
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
        video: { 
          facingMode: "environment",
          width: { ideal: 3840 }, 
          height: { ideal: 2160 } 
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
           const videoTrack = stream.getVideoTracks()[0];
           try {
             if (videoTrack && (videoTrack.getCapabilities() as any).torch) {
               setHasFlash(true);
             }
           } catch (e) {
             console.log("Torch capability check failed", e);
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

  const startFoodAnalysisMutation = useMutation({
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
      
      queryClient.setQueryData(['food_entries', user?.id], (old: FoodEntry[] | undefined) => {
        return [newEntry as FoodEntry, ...(old || [])];
      });

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

  const startMenuAnalysisMutation = useMutation({
    mutationFn: async (imageData: string) => {
      if (!user) throw new Error('User not found');

      const { data: newEntry, error: dbError } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          food_name: 'Analizando Menú...',
          image_url: imageData,
          status: 'processing',
          calories: '0', 
          health_rating: 'Moderado',
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return { newEntry, imageData };
    },
    onSuccess: ({ newEntry, imageData }) => {
      logUsage('food_scan');
      
      queryClient.setQueryData(['food_entries', user?.id], (old: FoodEntry[] | undefined) => {
        return [newEntry as FoodEntry, ...(old || [])];
      });

      navigate('/');

      supabase.functions.invoke('analyze-menu', {
        body: { 
          imageData, 
          goal: profile?.goal || 'maintain_weight',
          weeklyRate: profile?.weekly_rate || 0.5,
          language: i18n.language 
        }
      }).then(async ({ data: analysisResult, error: aiError }) => {
        if (aiError) {
          console.error("Menu Analysis Error:", aiError);
          await supabase.from('food_entries').update({ status: 'failed', reason: 'Falló el análisis del menú.' }).eq('id', newEntry.id);
        } else {
          await supabase.from('food_entries').update({
            food_name: t('menu_analysis.title', 'Análisis de Menú'),
            status: 'completed',
            reason: analysisResult.summary,
            analysis_data: analysisResult
          }).eq('id', newEntry.id);
        }
        queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
      });
    },
    onError: (err: Error) => {
      console.error("Menu analysis start error:", err);
      toast.error(t('scanner.error_analysis'), { description: t('common.error_friendly') });
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
    
    if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(video, 0, 0, width, height);
    }
    
    // Calidad reducida a 0.6 para transmisión más rápida
    const imageData = canvas.toDataURL("image/jpeg", 0.6);
    
    setCapturedImage(imageData);
    stopCamera();
    setState("loading");

    const { canProceed, limit } = await checkLimit('food_scan', 4, 'daily');
    if (canProceed) {
      if (scanMode === 'menu') {
        startMenuAnalysisMutation.mutate(imageData);
      } else {
        startFoodAnalysisMutation.mutate(imageData);
      }
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
          
          // Calidad reducida a 0.6 para transmisión más rápida y evitar límites
          const resizedImageData = canvas.toDataURL("image/jpeg", 0.6);
          
          setCapturedImage(resizedImageData);
          
          if (scanMode === 'menu') {
            startMenuAnalysisMutation.mutate(resizedImageData);
          } else {
            startFoodAnalysisMutation.mutate(resizedImageData);
          }
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
        if (scanMode === 'menu') {
          startMenuAnalysisMutation.mutate(capturedImage);
        } else {
          startFoodAnalysisMutation.mutate(capturedImage);
        }
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
    setMenuData(null); 
    if (fileInputRef.current) fileInputRef.current.value = "";
    startCamera();
  };

  const handleClose = () => navigate(-1);

  const isPending = startFoodAnalysisMutation.isPending || startMenuAnalysisMutation.isPending;

  const handleMenuDrawerClose = () => {
    setIsMenuDrawerOpen(false);
    navigate('/'); 
  };

  return (
    <>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="fixed inset-0 w-[100dvw] h-[100dvh] bg-black text-white z-50 flex flex-col overflow-hidden touch-none"
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
          {capturedImage && (state === 'captured' || state === 'loading' || isPending) && (
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
            
            {scanMode === 'menu' && (
                <div className="absolute left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                    <span className="text-white font-semibold text-sm">{t('bottom_nav.scan_menu', 'Escanear Menú')}</span>
                </div>
            )}

            <motion.button
              onClick={() => setIsInfoOpen(true)}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md shadow-lg border border-white/10"
              whileTap={{ scale: 0.9 }}
            >
              <HelpCircle className="w-8 h-8 text-white" />
            </motion.button>
          </header>

          <div className="flex-1 relative flex items-center justify-center">
            {state === 'camera' && <Viewfinder mode={scanMode} />}
            {(state === 'loading' || isPending) && (
               <div className="flex flex-col items-center gap-4 bg-black/30 backdrop-blur-sm p-8 rounded-2xl z-50 relative">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <p className="text-xl font-bold animate-pulse">{t('scanner.processing')}</p>
               </div>
            )}
          </div>

          <footer className="flex flex-col items-center gap-6 w-full p-4 pb-16 pointer-events-auto z-50 relative">
            {state === 'captured' && !isPending ? (
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

      <Drawer open={showDisclaimer} onOpenChange={handleDrawerOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <div className="mx-auto w-full max-w-sm">
            <div className="p-6 pb-0 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Info className="w-8 h-8" />
              </div>
              <DrawerHeader className="px-0 pb-2">
                <DrawerTitle className="text-2xl font-bold">{t('scanner.disclaimer_title')}</DrawerTitle>
                <DrawerDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
                  {t('scanner.disclaimer_text')}
                </DrawerDescription>
              </DrawerHeader>
            </div>
            <DrawerFooter className="p-6 pt-4">
              <Button onClick={handleAcceptDisclaimer} className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/20">
                {t('scanner.disclaimer_accept')}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <MenuAnalysisDrawer
        isOpen={isMenuDrawerOpen}
        onClose={handleMenuDrawerClose}
        data={menuData}
      />
    </>
  );
};

export default Scanner;