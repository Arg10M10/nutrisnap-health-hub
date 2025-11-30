import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default PageLayout;
