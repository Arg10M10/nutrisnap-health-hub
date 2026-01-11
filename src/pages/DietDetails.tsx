import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dietPlans } from "@/data/dietPlans";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Target, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DietDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const diet = dietPlans.find((d) => d.id === id);

  if (!diet) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Diet not found</p>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  const rawIdealFor = t(diet.idealForKey as any, { returnObjects: true });
  const idealFor = Array.isArray(rawIdealFor) ? rawIdealFor : [];

  const rawNotRecommended = t(diet.notRecommendedKey as any, { returnObjects: true });
  const notRecommended = Array.isArray(rawNotRecommended) ? rawNotRecommended : [];

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Hero Section */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img
          src={diet.image}
          alt={t(diet.nameKey as any)}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background/90" />
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 border border-white/10 w-12 h-12"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background to-transparent">
          <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight tracking-tight drop-shadow-sm">
            {t(diet.nameKey as any)}
          </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-6 space-y-8 animate-in slide-in-from-bottom-8 duration-500 delay-100">
        
        {/* Description */}
        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
          {t(diet.descriptionKey as any)}
        </p>

        {/* Macros Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> {t('diet_plans.labels.macros')}
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-2xl font-black text-red-500">{diet.macros.protein}</span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground/80 mt-1">{t('home.protein')}</span>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-2xl font-black text-orange-500">{diet.macros.carbs}</span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground/80 mt-1">{t('home.carbs')}</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-2xl font-black text-blue-500">{diet.macros.fats}</span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground/80 mt-1">{t('home.fats')}</span>
            </div>
          </div>
        </div>

        {/* Objective */}
        <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
          <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-foreground">
            <Target className="w-6 h-6 text-primary" />
            {t('diet_plans.labels.objective')}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {t(diet.objectiveKey as any)}
          </p>
        </div>

        {/* Ideal For */}
        <div>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-foreground px-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            {t('diet_plans.labels.ideal_for')}
          </h3>
          <ul className="grid gap-3">
            {idealFor.map((item: any, idx: number) => (
              <li key={idx} className="flex gap-4 items-start bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground/90 leading-relaxed">
                  {typeof item === 'string' ? item : JSON.stringify(item)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not Recommended */}
        {notRecommended.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-foreground px-2 pt-4">
              <XCircle className="w-6 h-6 text-red-500" />
              {t('diet_plans.labels.not_recommended')}
            </h3>
            <ul className="grid gap-3">
              {notRecommended.map((item: any, idx: number) => (
                <li key={idx} className="flex gap-4 items-start bg-red-50 dark:bg-red-900/5 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-900/80 dark:text-red-200/80 leading-relaxed">
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="h-8" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default DietDetails;