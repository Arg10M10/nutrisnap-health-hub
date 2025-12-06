import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Bell, ShoppingBag, Sparkles, Clock } from 'lucide-react';

const Subscribe = () => {
  const navigate = useNavigate();

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
      title: "Today",
      description: "Unlock all premium features like AI calorie scanning and much more.",
    },
    {
      icon: Bell,
      title: "In 2 days",
      description: "We'll send you a reminder that your trial is ending soon.",
    },
    {
      icon: ShoppingBag,
      title: "In 3 days - Billing starts",
      description: "You'll be charged unless you cancel anytime before.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
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
          <h1 className="text-3xl font-bold text-foreground mb-4">3-Day Free Route</h1>
        </div>

        <motion.div 
          className="relative space-y-8 pl-12 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
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

        <Card className="shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="border-2 border-primary bg-primary/5 rounded-lg p-4 text-center">
              <p className="font-bold text-lg text-primary">Monthly Access</p>
              <p className="text-2xl font-extrabold text-foreground">$2.00<span className="text-base font-medium text-muted-foreground">/Month</span></p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={handleSubscribe} size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/30">
            Start my 3-day free trial
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            You don't have to pay anything now
          </p>
          <Button variant="link" onClick={handleSkip} className="text-muted-foreground">
            Maybe Later
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscribe;