import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { diets, Diet } from "@/data/diets";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import DietDetailDrawer from "@/components/DietDetailDrawer";

const DietTypes = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDiet, setSelectedDiet] = useState<Diet | null>(null);

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{t('diet_list.title', 'Tipos de Dieta')}</h1>
          </div>
        </header>

        <p className="text-muted-foreground px-1">
          {t('diet_list.subtitle', 'Explora diferentes estilos de alimentación para encontrar el mejor para ti.')}
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {diets.map((diet) => (
            <Card 
              key={diet.id} 
              className="cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]"
              onClick={() => setSelectedDiet(diet)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="text-4xl bg-muted/30 p-2 rounded-xl">{diet.icon}</div>
                <div>
                  <CardTitle className="text-lg">{diet.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{diet.category}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {diet.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <DietDetailDrawer 
        diet={selectedDiet}
        isOpen={!!selectedDiet}
        onClose={() => setSelectedDiet(null)}
      />
    </PageLayout>
  );
};

export default DietTypes;