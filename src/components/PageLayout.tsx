import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
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
      className="min-h-screen bg-background pb-28"
    >
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNav />
    </motion.div>
  );
};

export default PageLayout;