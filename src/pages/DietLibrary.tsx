import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dietPlans, DietPlan } from "@/data/dietPlans";
import DietPlanDrawer from "@/components/diets/DietPlanDrawer";

const DietLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDiet, setSelectedDiet] = useState<DietPlan | null>(null);

  return (
    <PageLayout>
      <div className="space-y-8 pb-10">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Book className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{t('bottom_nav.diet_library', 'Dietas')}</h1>
          </div>
        </header>
        
        <div className="flex flex-col gap-6">
          {dietPlans.map((diet) => (
            <div 
              key={diet.id}
              onClick={() => setSelectedDiet(diet)}
              className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-xl cursor-pointer group transition-all active:scale-[0.98]"
            >
              <img 
                src={diet.image} 
                alt={t(diet.nameKey as any)} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradient overlays for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 opacity-90" />

              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-4xl font-black text-white leading-none tracking-tight mb-3 drop-shadow-lg">
                    {t(diet.nameKey as any)}
                  </h3>
                  <div className="flex items-center gap-1 text-orange-400 font-bold text-lg group-hover:translate-x-2 transition-transform duration-300">
                    {t('common.view_diet', 'Ver Dieta')} <ChevronRight className="w-5 h-5 stroke-[3px]" />
                  </div>
                </div>

                <div>
                  <p className="text-white/95 text-lg font-medium leading-relaxed drop-shadow-md line-clamp-3">
                    {t(diet.descriptionKey as any)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DietPlanDrawer 
        diet={selectedDiet}
        isOpen={!!selectedDiet}
        onClose={() => setSelectedDiet(null)}
      />
    </PageLayout>
  );
};

export default DietLibrary;