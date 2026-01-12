import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { diets } from "@/data/diets";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Users, AlertTriangle, PieChart, Check, X } from "lucide-react";
import { motion } from "framer-motion";

const DietDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const diet = diets.find((d) => d.id === id);

  if (!diet) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Dieta no encontrada</p>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8 relative">
      {/* Header con Imagen de fondo */}
      <div className="relative h-[45vh] w-full">
        <img 
          src={diet.image} 
          alt={t(diet.nameKey as any)} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60" />
        
        {/* Botón Volver Flotante */}
        <div className="absolute top-4 left-4 z-50">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-md border border-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>

        {/* Título sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background to-transparent">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-foreground leading-none drop-shadow-xl"
          >
            {t(diet.nameKey as any)}
          </motion.h1>
        </div>
      </div>

      <div className="px-6 space-y-8 -mt-2 relative z-10">
        
        {/* Descripción */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t(diet.descriptionKey as any)}
          </p>
        </motion.div>

        {/* Objetivo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/5 p-6 rounded-3xl border border-primary/10"
        >
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> {t('diet_list.objective')}
            </h3>
            <p className="text-base font-medium text-foreground leading-relaxed">
                {t(diet.objectiveKey as any)}
            </p>
        </motion.div>

        {/* Ideal Para */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> {t('diet_list.ideal_for')}
            </h3>
            <ul className="space-y-4">
                {diet.idealForKeys?.map((key, idx) => (
                    <li key={idx} className="flex gap-3 text-base">
                        <div className="mt-1 min-w-[24px] h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                        <span className="text-foreground/90">{t(key as any)}</span>
                    </li>
                ))}
            </ul>
        </motion.div>

        {/* No Recomendada Para */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/20"
        >
            <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {t('diet_list.not_recommended_for')}
            </h3>
            <ul className="space-y-3">
                {diet.notRecommendedForKeys?.map((key, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                        <div className="mt-0.5 min-w-[20px] text-red-500">
                            <X className="w-5 h-5" />
                        </div>
                        <span className="text-foreground/80">{t(key as any)}</span>
                    </li>
                ))}
            </ul>
        </motion.div>

        {/* Macros Objetivo */}
        {diet.macros && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card shadow-sm p-6 rounded-3xl border border-border"
            >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                    <PieChart className="w-4 h-4" /> {t('diet_list.target_macros')}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border">
                    <div className="px-2">
                        <div className="text-xl font-black text-red-500 mb-1">{diet.macros.protein}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Proteína</div>
                    </div>
                    <div className="px-2">
                        <div className="text-xl font-black text-orange-500 mb-1">{diet.macros.carbs}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Carbos</div>
                    </div>
                    <div className="px-2">
                        <div className="text-xl font-black text-blue-500 mb-1">{diet.macros.fats}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Grasas</div>
                    </div>
                </div>
            </motion.div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};

export default DietDetail;