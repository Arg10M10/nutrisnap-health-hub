import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '@/hooks/useLocalStorage';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const AppTutorial = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [run, setRun] = useState(false);
  
  const storageKey = user?.id ? `tutorial_seen_v4_${user.id}` : 'tutorial_seen_v4_guest';
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage(storageKey, false);

  useEffect(() => {
    // Pequeño delay para asegurar que la UI esté lista
    const timer = setTimeout(() => {
      if (!hasSeenTutorial) {
        setRun(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasSeenTutorial]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      setHasSeenTutorial(true);
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: t('tutorial.welcome_content'),
      title: t('tutorial.welcome_title'),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#daily-summary-carousel',
      content: t('tutorial.carousel_content'),
      title: t('tutorial.carousel_title'),
      placement: 'bottom',
      scrollOffset: 100,
    },
    {
      target: '#scan-action-button',
      content: t('tutorial.scanner_content'),
      title: t('tutorial.scanner_title'),
      placement: 'top',
      disableScrolling: true,
    },
    {
      target: '#nav-progress',
      content: t('tutorial.progress_content'),
      title: t('tutorial.progress_title'),
      placement: 'top',
      disableScrolling: true,
    },
    {
      target: '#nav-settings',
      content: t('tutorial.settings_content'),
      title: t('tutorial.settings_title'),
      placement: 'top',
      disableScrolling: true,
    },
  ];

  const CustomTooltip = ({
    index,
    step,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
    size
  }: TooltipRenderProps) => {
    return (
      <div {...tooltipProps} className="w-[85vw] max-w-sm z-50 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-card text-card-foreground p-6 rounded-3xl shadow-2xl border border-border/50 relative overflow-hidden flex flex-col w-full"
        >
          {/* Fondo decorativo sutil */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          {/* Header */}
          <div className="flex justify-between items-start mb-4 relative z-10">
            {step.title && (
              <h3 className="text-xl font-bold text-primary leading-tight pr-4">
                {step.title}
              </h3>
            )}
            <button 
              {...skipProps} 
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 -mr-2 -mt-2 bg-background/50 rounded-full"
              aria-label="Skip tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="text-muted-foreground text-base leading-relaxed mb-6">
              {step.content}
            </div>

            <div className="flex items-center justify-between mt-auto">
              {/* Dots Indicator */}
              <div className="flex gap-1.5">
                {Array.from({ length: size }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === index ? "bg-primary w-6" : "bg-muted-foreground/30 w-2"
                    )}
                  />
                ))}
              </div>

              {/* Action Button */}
              <Button
                {...primaryProps}
                className="rounded-full px-6 h-11 shadow-lg shadow-primary/20 text-base font-semibold"
                size="sm"
              >
                {isLastStep ? (
                  <span className="flex items-center gap-2">
                    {t('tutorial.finish')} <Check className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t('diets_onboarding.next')} <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose={true}
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip} 
      floaterProps={{
        hideArrow: true, // Ocultar flecha para diseño más limpio
        disableAnimation: true, // Ayuda con el posicionamiento en móviles
      }}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.8)', // Un poco más oscuro para mejor contraste
          spotlightPadding: 10,
        },
        spotlight: {
          borderRadius: 24, // Más redondeado para coincidir con los elementos de la UI
        }
      }}
      // CRÍTICO: Estas opciones ayudan a fijar el highlight en elementos 'fixed' como el bottom nav
      disableScrollParentFix={true}
      scrollOffset={100}
    />
  );
};

export default AppTutorial;