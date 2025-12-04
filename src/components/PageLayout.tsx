import { ReactNode } from "react";
import { motion, Transition } from "framer-motion";

interface PageLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, scale: 0.99 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.99 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.15,
};

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="dark:bg-gradient-to-b dark:from-background-gradient-start dark:to-background"
    >
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </motion.div>
  );
};

export default PageLayout;