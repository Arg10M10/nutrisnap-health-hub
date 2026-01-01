import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { addWeeks, format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ArrowRight, Target, TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

const GoalProjection = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiOpacity, setConfettiOpacity] = useState(1);
  
  // Simple window size for confetti
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Iniciar fade out a los 2.5 segundos
    const fadeTimer = setTimeout(() => setConfettiOpacity(0), 2500);
    // Eliminar completamente del DOM un poco después
    const removeTimer = setTimeout(() => setShowConfetti(false), 4000);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.goal === 'maintain_weight') {
        setTargetDate(null);
      } else if (profile.weight && profile.goal_weight && profile.weekly_rate && profile.weekly_rate > 0) {
        // Calcular diferencia absoluta (sirve para ganar o perder peso)
        const weightDifference = Math.abs(profile.weight - profile.goal_weight);
        
        // El weekly_rate en la base de datos ya está en la unidad correcta según la lógica de guardado
        const weeksNeeded = weightDifference / profile.weekly_rate;
        
        const date = addWeeks(new Date(), weeksNeeded);
        setTargetDate(date);
      }
    }
  }, [profile]);

  const handleContinue = () => {
    navigate('/', { replace: true });
  };

  const isImperial = profile?.units === 'imperial';
  const unitLabel = isImperial ? 'lbs' : 'kg';
  const locale = i18n.language.startsWith('es') ? es : enUS;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {showConfetti && (
        <div 
          className="absolute inset-0 pointer-events-none z-50 transition-opacity duration-1000 ease-out"
          style={{ opacity: confettiOpacity }}
        >
          <Confetti 
            width={windowSize.width} 
            height={windowSize.height} 
            numberOfPieces={150} 
            gravity={0.2} 
            recycle={false} // Evitar que siga generando piezas infinitamente
          />
        </div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {profile?.goal === 'maintain_weight' 
              ? t('goal_projection.maintenance_title') 
              : t('goal_projection.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {profile?.goal === 'maintain_weight'
              ? t('goal_projection.maintenance_desc')
              : t('goal_projection.desc')}
          </p>
        </motion.div>

        {targetDate && (
          <motion.div variants={itemVariants}>
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t('goal_projection.estimated_date')}
                </p>
                <div className="flex items-center justify-center gap-3 text-primary">
                  <Calendar className="w-8 h-8" />
                  <p className="text-3xl font-bold">
                    {format(targetDate, 'd MMM, yyyy', { locale })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 text-center">
            <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('goal_projection.goal_weight')}</p>
            <p className="text-xl font-bold">{profile?.goal_weight} {unitLabel}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('goal_projection.weekly_pace')}</p>
            <p className="text-xl font-bold">
              {profile?.goal === 'maintain_weight' ? '-' : `${profile?.weekly_rate} ${unitLabel}`}
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-8">
          <Button 
            onClick={handleContinue} 
            size="lg" 
            className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25"
          >
            {t('goal_projection.button')} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GoalProjection;