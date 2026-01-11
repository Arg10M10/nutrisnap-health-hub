import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dietPlans, DietPlan } from "@/data/dietPlans";
import DietPlanDrawer from "@/components/diets/DietPlanDrawer";
import { Card, CardContent } from "@/components/ui/card";

const DietLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDiet, setSelectedDiet] = useState<DietPlan | null>(null);

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Book className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{t('bottom_nav.diet_library', 'Dietas')}</h1>
          </div>
        </header>
        
        <div className="grid gap-4">
          {dietPlans.map((diet) => (
            <Card 
                key={diet.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98] border-none shadow-sm bg-card group"
                onClick={() => setSelectedDiet(diet)}
            >
                <div className="relative h-32 w-full overflow-hidden">
                    <img 
                        src={diet.image} 
                        alt={t(diet.nameKey as any)} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">
                            {t(diet.nameKey as any)}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-white opacity-80" />
                    </div>
                </div>
                <CardContent className="p-4 pt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {t(diet.descriptionKey as any)}
                    </p>
                </CardContent>
            </Card>
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