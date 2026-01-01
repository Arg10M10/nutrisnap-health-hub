import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  const text = "Calorel";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Leaf className="w-16 h-16 text-primary" />
        <motion.h1
          className="text-6xl font-black tracking-tighter text-foreground flex"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label={text}
        >
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
      </motion.div>
    </div>
  );
};

export default SplashScreen;