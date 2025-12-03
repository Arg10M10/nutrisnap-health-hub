import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
};

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </motion.div>
  );
};

export default PageLayout;