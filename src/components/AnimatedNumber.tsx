import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  toFixed?: number;
}

const AnimatedNumber = ({ value, className, toFixed = 0 }: AnimatedNumberProps) => {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => latest.toFixed(toFixed));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.5,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
};

export default AnimatedNumber;