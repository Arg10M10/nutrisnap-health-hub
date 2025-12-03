import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberSwitchProps {
  number: number | string;
  className?: string;
}

const NumberSwitch = ({ number, className }: NumberSwitchProps) => {
  return (
    <div className={cn("relative h-[1.2em] overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={number}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {number}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default NumberSwitch;