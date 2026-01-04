import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-confetti';
import useWindowSize from '@/hooks/useWindowSize';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2, Crown, Sparkles } from 'lucide-react';

const SubscriptionSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { width, height } = useWindowSize();
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiOpacity, setConfettiOpacity] = useState(1);

  // Recibimos estado desde la navegación
  const isTrial = location.state?.isTrial || false;
  const planType = location.state?.plan || 'annual'; // 'annual' | 'monthly'

  useEffect(() => {
    // Fade out confetti after 3 seconds
    const fadeTimer = setTimeout(() => setConfettiOpacity(0), 4000);
    // Remove confetti component after fade out
    const removeTimer = setTimeout(() => setShowConfetti(false), 5500);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleContinue = () => {
    navigate('/', { replace: true });
  };

  let title, subtitle, description, Icon;

  if (isTrial) {
    title = t('subscription_success.title_trial');
    subtitle = t('subscription_success.subtitle_trial');
    description = t('subscription_success.desc_trial');
    Icon = Sparkles;
  } else if (planType === 'annual') {
    title = t('subscription_success.title_annual');
    subtitle = t('subscription_success.subtitle_annual');
    description = t('subscription_success.desc_annual');
    Icon = Crown;
  } else {
    title = t('subscription_success.title_monthly');
    subtitle = t('subscription_success.subtitle_monthly');
    description = t('subscription_success.desc_monthly');
    Icon = CheckCircle2;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden text-center">
      {/* Confetti Layer */}
      {showConfetti && (
        <div 
          className="absolute inset-0 pointer-events-none z-50 transition-opacity duration-1000 ease-out"
          style={{ opacity: confettiOpacity }}
        >
          <Confetti 
            width={width} 
            height={height} 
            numberOfPieces={200} 
            gravity={0.15} 
            recycle={true}
            colors={['#84CC16', '#22C55E', '#EAB308', '#F59E0B', '#3B82F6']} 
          />
        </div>
      )}

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="z-10 w-full max-w-md space-y-8"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="bg-background p-6 rounded-full border-4 border-primary/20 shadow-2xl relative z-10">
              <Icon className="w-20 h-20 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-foreground tracking-tight"
          >
            {title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <p className="text-xl font-bold text-primary">{subtitle}</p>
            <p className="text-muted-foreground text-lg leading-relaxed px-4">
              {description}
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pt-8"
        >
          <Button 
            size="lg" 
            className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/30 font-bold animate-in fade-in zoom-in duration-500"
            onClick={handleContinue}
          >
            {t('subscription_success.button')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;