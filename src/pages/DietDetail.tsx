import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { diets } from "@/data/diets";
import { Button } from "@/components/ui/button";
import { X, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DietDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const diet = diets.find((d) => d.id === id);

  if (!diet) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Dieta no encontrada</p>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const handleStartDiet = async () => {
    if (!user) {
        navigate('/login');
        return;
    }
    
    // Save preference
    try {
        const { error } = await supabase.from('profiles').update({
            goal: 'lose_weight', // Simplified for now, or based on diet
            // In a real app we might store 'diet_preference': diet.id
        }).eq('id', user.id);
        
        if (error) throw error;
        
        toast.success(t('common.saved', { defaultValue: 'Preferencia guardada' }));
        navigate('/diets'); // Go to weekly plan
    } catch (e) {
        console.error(e);
        navigate('/diets');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background relative flex flex-col"
    >
      {/* Header Image Section - Takes ~65% of viewport for better immersion */}
      <div className="relative h-[65vh] w-full shrink-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={diet.image} 
          alt={t(diet.nameKey as any)} 
          className="w-full h-full object-cover" 
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        {/* Close Button - Top Right */}
        <div className="absolute top-12 right-6 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md w-10 h-10 border border-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Title Area - Top Left */}
        <div className="absolute top-24 left-6 pr-12">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-white leading-[0.9] drop-shadow-lg tracking-tighter"
          >
            {t(diet.nameKey as any)}
          </motion.h1>
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#fbbf24] font-black tracking-[0.2em] text-sm mt-3 block uppercase drop-shadow-md pl-1"
          >
            DIET
          </motion.span>
        </div>

        {/* Short Description Overlay - Bottom */}
        <div className="absolute bottom-12 left-6 right-6 z-20">
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/95 text-xl font-medium leading-snug drop-shadow-md"
          >
            {t(diet.shortDescKey as any)}
          </motion.p>
        </div>
      </div>

      {/* Content Body - Improved integration */}
      <div className="flex-1 bg-background -mt-6 relative rounded-t-[32px] z-10 px-6 pt-8 pb-32">
         {/* Small decorative handle to mimic drawer look */}
         <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 opacity-50" />

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
         >
            {/* "How it Works" Section */}
            <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground">How it Works</h2>
                <p className="text-muted-foreground leading-relaxed text-lg font-normal">
                    {t(diet.descriptionKey as any)}
                </p>
            </section>

            {/* Objective Section */}
            <section>
                <h3 className="font-bold text-lg mb-2 text-foreground uppercase tracking-wider text-xs opacity-70">{t('diet_list.objective', 'Objective')}</h3>
                <p className="text-foreground leading-relaxed font-medium">
                    {t(diet.objectiveKey as any)}
                </p>
            </section>

            {/* Key Benefits / Ideal For */}
            <section>
                <h3 className="font-bold text-lg mb-4 text-foreground">{t('diet_list.ideal_for', 'Ideal For')}</h3>
                <ul className="space-y-3">
                    {diet.idealForKeys.map((key, idx) => (
                        <li key={idx} className="flex gap-4 items-start p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-colors">
                            <div className="bg-primary/10 p-1.5 rounded-full shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5 text-primary" strokeWidth={4} />
                            </div>
                            <span className="text-foreground/90 font-medium">{t(key as any)}</span>
                        </li>
                    ))}
                </ul>
            </section>
         </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-8 right-6 z-50"
      >
         <Button 
            onClick={handleStartDiet}
            className="h-14 pl-8 pr-6 rounded-full shadow-xl shadow-primary/30 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
         >
            Start Diet <ArrowRight className="w-5 h-5" />
         </Button>
      </motion.div>
    </motion.div>
  );
};

export default DietDetail;