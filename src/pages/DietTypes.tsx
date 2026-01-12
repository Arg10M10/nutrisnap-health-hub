import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { diets } from "@/data/diets";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";

const DietTypes = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className="space-y-6 pb-20">
        <header className="flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('diet_list.title', 'Dietas Premium')}</h1>
          </div>
        </header>

        <p className="text-muted-foreground px-1 -mt-2">
          {t('diet_list.subtitle', 'Explora diferentes estilos de alimentación para encontrar el mejor para ti.')}
        </p>
        
        <div className="grid grid-cols-1 gap-6">
          {diets.map((diet) => (
            <div 
              key={diet.id} 
              className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer shadow-lg group transition-transform active:scale-[0.98]"
              onClick={() => navigate(`/diet-types/${diet.id}`)}
            >
              {/* Background Image */}
              <img 
                src={diet.image} 
                alt={t(diet.nameKey as any)} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

              {/* Content Container */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                
                {/* Top Section */}
                <div>
                  <h2 className="text-4xl font-bold text-white mb-1 drop-shadow-md">
                    {t(diet.nameKey as any)}
                  </h2>
                  <div className="flex items-center text-orange-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    {t('diet_list.view_diet', 'Ver Dieta')} <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>

                {/* Bottom Description */}
                <div className="max-w-[90%]">
                  <p className="text-white/90 text-lg font-medium leading-snug drop-shadow-md">
                    {t(diet.shortDescKey as any)}
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

export default DietTypes;