import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppTutorial = () => {
  const { t } = useTranslation();
  const [run, setRun] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage('has_seen_tutorial_v2', false); // Updated version key
  const { theme } = useTheme();

  useEffect(() => {
    // Small delay to ensure everything is rendered
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
    },
    {
      target: '#scan-action-button',
      content: t('tutorial.scanner_content'),
      title: t('tutorial.scanner_title'),
      placement: 'top',
    },
    {
      target: '#nav-progress',
      content: t('tutorial.progress_content'),
      title: t('tutorial.progress_title'),
      placement: 'top',
    },
    {
      target: '#nav-settings',
      content: t('tutorial.settings_content'),
      title: t('tutorial.settings_title'),
      placement: 'top',
    },
  ];

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Componente de Tooltip Personalizado y Moderno
  const CustomTooltip = ({
    index,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
    size
  }: TooltipRenderProps) => {
    return (
      <div {...tooltipProps} className="max-w-xs sm:max-w-sm z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-card text-card-foreground p-6 rounded-[2rem] shadow-2xl border border-border/50 relative overflow-hidden"
        >
          {/* Fondo decorativo sutil */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          {/* Botón Cerrar (Skip) */}
          <button 
            {...skipProps} 
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            {step.title && (
              <h3 className="text-xl font-bold mb-2 text-primary pr-6 leading-tight">
                {step.title}
              </h3>
            )}
            <div className="text-muted-foreground mb-6 text-base leading-relaxed">
              {step.content}
            </div>

            <div className="flex items-center justify-between mt-4">
              {/* Indicadores de Puntos (Dots) */}
              <div className="flex gap-1.5">
                {Array.from({ length: size }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === index ? "bg-primary w-4" : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {/* Botón Principal */}
              <Button
                {...primaryProps}
                className="rounded-full px-6 h-10 shadow-lg shadow-primary/20"
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
      tooltipComponent={CustomTooltip} // Usamos nuestro componente personalizado
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.75)', // Fondo oscuro más elegante
        },
        spotlight: {
          borderRadius: 20, // Bordes redondeados en el área resaltada
        }
      }}
    />
  );
};

export default AppTutorial;