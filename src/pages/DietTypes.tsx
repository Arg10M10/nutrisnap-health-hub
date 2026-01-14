import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { diets } from "@/data/diets";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const DietTypes = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Custom Header matching the design */}
      <header className="bg-[#10b981] text-white pt-12 pb-6 px-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full hover:bg-white/20 text-white -ml-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{t('diet_list.title', 'Premium Diets')}</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-20">
        <div className="grid grid-cols-1 gap-6">
          {diets.map((diet, index) => (
            <motion.div 
              key={diet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-[2rem] overflow-hidden cursor-pointer shadow-xl group transition-all active:scale-[0.98]"
              onClick={() => navigate(`/diet-types/${diet.id}`)}
            >
              {/* Background Image */}
              <img 
                src={diet.image} 
                alt={t(diet.nameKey as any)} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradient Overlay - Only at bottom for description readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* Content Container */}
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                
                {/* Top Section: Title & Link */}
                <div className="flex flex-col items-start gap-2">
                  <h2 className={cn(
                    "text-4xl font-bold leading-tight",
                    diet.textColor === 'dark' ? "text-gray-900" : "text-white drop-shadow-md"
                  )}>
                    {t(diet.nameKey as any)}
                  </h2>
                  
                  <div className="flex items-center text-orange-500 font-bold text-base group-hover:translate-x-1 transition-transform bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                    {t('diet_list.view_diet', 'View Diet')} 
                    <ChevronRight className="w-5 h-5 ml-0.5" strokeWidth={3} />
                  </div>
                </div>

                {/* Bottom Section: Description */}
                <div className="max-w-[95%]">
                  <p className="text-white text-lg font-medium leading-snug drop-shadow-md">
                    {t(diet.shortDescKey as any)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DietTypes;