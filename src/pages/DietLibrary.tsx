import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DietLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 text-muted-foreground">
          <Book className="w-16 h-16 mb-4 opacity-20" />
          <p>{t('recipes.coming_soon', 'Próximamente...')}</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default DietLibrary;