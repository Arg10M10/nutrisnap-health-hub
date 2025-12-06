import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Bell, ShoppingBag, Sparkles, Clock, Zap, ChefHat, Target } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Subscribe = () => {
  const navigate = useNavigate();
  const [planType, setPlanType] = useState<'trial' | 'paid'>('trial');

  const handleSubscribe = () => {
    // Placeholder for Play Store Billing. For now, just navigate to the app.
    navigate('/');
  };

  const handleSkip = () => {
    navigate('/');
  };

  const timelineItems = [
    {
      icon: Lock,
      title: "Hoy",
      description: "Desbloquea todas las funciones premium como el escáner de calorías por IA y mucho más.",
    },
    {
      icon: Bell,
      title: "En 2 días",
      description: "Te enviaremos un recordatorio de que tu prueba está a punto de terminar.",
    },
    {
      icon: ShoppingBag,
      title: "En 3 días - Comienza la facturación",
      description: "Se te cobrará a menos que canceles en cualquier momento antes.",
    },
  ];

  const premiumFeatures = [
    { icon: Sparkles, text: "Escáner de alimentos con IA" },
    { icon: Zap, text: "Análisis de ejercicio por IA" },
    { icon: ChefHat, text: "Planes de dieta personalizados" },
    { icon: Target, text: "Sugerencias de metas inteligentes" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-end bg-background p-4 sm:justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="p-6 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Vuélvete Premium</h1>
        </div>

        <ToggleGroup
          type="single"
          value={planType}
          onValueChange={(value: 'trial' | 'paid') => value && setPlanType(value)}
          className="grid grid-cols-2 w-full mb-8"
        >
          <ToggleGroupItem value="trial" className="h-12 text-base">Prueba Gratuita de 3 Días</ToggleGroupItem>
          <ToggleGroupItem value="paid" className="h-12 text-base">Pagar Ahora</ToggleGroupItem>
        </ToggleGroup>

        {planType === 'trial' ? (
          <motion.div 
            key="trial"
            className="relative space-y-8 pl-12 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="absolute left-[23px] top-2 h-full w-0.5 bg-primary/20" />
            {timelineItems.map((item, index) => (
              <motion.div key={index} className="relative flex items-start gap-4" variants={itemVariants}>
                <div className="absolute left-[-23px] mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-card border-4 border-background">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="paid"
            className="mb-8 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <h3 className="text-center font-semibold text-lg text-foreground">Funciones Premium</h3>
            {premiumFeatures.map((feature, index) => (
              <motion.div key={index} className="flex items-center gap-4" variants={itemVariants}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <feature.icon className="h-5 w-5" />
                </div>
                <p className="text-foreground">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Card className="shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="border-2 border-primary bg-primary/5 rounded-lg p-4 text-center">
              <p className="font-bold text-lg text-primary">Acceso Mensual</p>
              <p className="text-2xl font-extrabold text-foreground">$2.00<span className="text-base font-medium text-muted-foreground">/Mes</span></p>
              {planType === 'trial' && <p className="text-sm text-muted-foreground mt-1">Después de 3 días gratis</p>}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={handleSubscribe} size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/30">
            {planType === 'trial' ? 'Comenzar mi prueba gratuita de 3 días' : 'Desbloquear Premium Ahora'}
          </Button>
          {planType === 'trial' && (
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              No tienes que pagar nada ahora
            </p>
          )}
          <Button variant="link" onClick={handleSkip} className="text-muted-foreground">
            Quizás más tarde
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscribe;