import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Recipes = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('recipes.title', 'Recetas')}</h1>
        </header>
        
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground opacity-50 space-y-4">
            <div className="text-6xl">👨‍🍳</div>
            <p className="text-lg font-medium">{t('recipes.coming_soon', 'Próximamente')}</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Recipes;