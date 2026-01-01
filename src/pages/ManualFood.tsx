import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Utensils } from 'lucide-react';
import ManualFoodEntry from '@/components/ManualFoodEntry';

const ManualFood = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 pt-8 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Utensils className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">{t('manual_food.title')}</h1>
        </div>
      </header>
      <main className="flex-1 p-4 flex flex-col">
        <div className="max-w-md mx-auto w-full">
          <ManualFoodEntry embedded={false} />
        </div>
      </main>
    </div>
  );
};

export default ManualFood;