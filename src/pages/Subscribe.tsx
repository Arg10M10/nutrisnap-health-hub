import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Sparkles, Zap, BarChart, Award } from 'lucide-react';

const Subscribe = () => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // Placeholder for Play Store Billing. For now, just navigate to the app.
    navigate('/');
  };

  const handleSkip = () => {
    navigate('/');
  };

  const featureItems = [
    { icon: Zap, text: "Unlimited AI food scans" },
    { icon: Sparkles, text: "Personalized AI diet plans" },
    { icon: BarChart, text: "Advanced progress tracking" },
    { icon: Award, text: "Exclusive badges and content" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">Go Premium</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Unlock your full potential.</CardDescription>
          </CardHeader>
          <CardContent className="px-8">
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {featureItems.map((item, index) => (
                <motion.li key={index} variants={itemVariants} className="flex items-center gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full"
            >
              <Button onClick={handleSubscribe} size="lg" className="w-full h-16 text-xl rounded-full shadow-lg shadow-primary/30">
                Subscribe for $2/month
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button variant="link" onClick={handleSkip}>
                Maybe Later
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Subscribe;