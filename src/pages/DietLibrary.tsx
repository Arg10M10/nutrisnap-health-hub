import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, ChevronRight } from "lucide-react";
import { dietPlans } from "@/data/dietPlans";

const DietLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
              onClick={() => navigate(`/diet/${diet.id}`)}
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
                  
                  {/* Botón visual integrado en la tarjeta */}
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-full pl-4 pr-3 py-2 text-white font-bold text-sm group-hover:bg-white/30 transition-colors">
                    {t('common.view_diet', 'Ver Dieta')} 
                    <div className="bg-white text-black rounded-full p-1">
                        <ChevronRight className="w-3 h-3 stroke-[4px]" />
                    </div>
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
    </PageLayout>
  );
};

export default DietLibrary;