import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, Bookmark, PlusCircle, CheckCircle, Sunrise, Sun, Coffee, Moon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { diets, Diet } from "@/data/diets";
import DietDetailDrawer from "@/components/DietDetailDrawer";

const Diets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDiet, setSelectedDiet] = useState<Diet | null>(null);

  const { data: userDiets, isLoading } = useQuery({
    queryKey: ['userDiets', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_diets')
        .select('saved_diet_ids, active_diet_id')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(error.message);
      }
      return data || { saved_diet_ids: [], active_diet_id: null };
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async (updatedDiets: { saved_diet_ids: number[], active_diet_id: number | null }) => {
      if (!user) throw new Error("User not found");
      const { error } = await supabase.from('user_diets').upsert({
        user_id: user.id,
        ...updatedDiets,
      }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDiets', user?.id] });
    },
    onError: (error) => {
      toast.error("No se pudo guardar el cambio.", { description: error.message });
    },
  });

  const savedDiets = userDiets?.saved_diet_ids || [];
  const activeDietId = userDiets?.active_diet_id || null;

  const handleToggleSave = (e: React.MouseEvent, dietId: number, dietName: string) => {
    e.stopPropagation();
    let newSavedDiets = [...savedDiets];
    let newActiveDietId = activeDietId;

    if (savedDiets.includes(dietId)) {
      newSavedDiets = savedDiets.filter((id) => id !== dietId);
      toast.success(`${dietName} eliminada de tus dietas`);
      if (activeDietId === dietId) {
        newActiveDietId = null;
      }
    } else {
      newSavedDiets.push(dietId);
      toast.success(`${dietName} guardada`, { icon: <Heart className="text-primary" /> });
    }
    mutation.mutate({ saved_diet_ids: newSavedDiets, active_diet_id: newActiveDietId });
  };

  const handleSetActive = (e: React.MouseEvent, dietId: number) => {
    e.stopPropagation();
    const diet = diets.find((d) => d.id === dietId);
    if (diet) {
      mutation.mutate({ saved_diet_ids: savedDiets, active_diet_id: dietId });
      toast.success(`¡Has empezado la dieta ${diet.name}!`, { icon: <CheckCircle className="text-primary" /> });
    }
  };

  const mySavedDiets = diets.filter((diet) => savedDiets.includes(diet.id));
  const activeDiet = diets.find((diet) => diet.id === activeDietId);

  const MealPlanItem = ({ icon: Icon, meal, food }: { icon: React.ElementType, meal: string, food: string }) => (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="font-semibold text-foreground">{meal}</p>
        <p className="text-muted-foreground">{food}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <PageLayout><div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin" /></div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Planes de Dieta</h1>
          <p className="text-muted-foreground text-lg">
            Explora, guarda y empieza la dieta perfecta para ti
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-6 h-6 text-secondary" />
            <h3 className="text-foreground">Tu Resumen</h3>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">Dietas Guardadas</p>
              <p className="text-2xl font-bold text-secondary">
                {savedDiets.length} {savedDiets.length === 1 ? "dieta" : "dietas"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground text-right">Dieta Activa</p>
              <p className="text-lg font-bold text-primary text-right">
                {activeDiet ? activeDiet.name : "Ninguna"}
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="explore" className="text-base">Explorar</TabsTrigger>
            <TabsTrigger value="saved" className="text-base">Mis Dietas</TabsTrigger>
          </TabsList>
          <TabsContent value="explore" className="mt-6 space-y-4">
            {diets.map((diet) => {
              const isSaved = savedDiets.includes(diet.id);
              return (
                <Card key={diet.id} className="p-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedDiet(diet)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{diet.icon}</span>
                      <div>
                        <h3 className="text-foreground mb-1">{diet.name}</h3>
                        <p className="text-base text-muted-foreground">{diet.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">Beneficios:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {diet.benefits.map((benefit, i) => (
                        <Badge key={i} variant="outline">{benefit}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={(e) => handleToggleSave(e, diet.id, diet.name)} variant={isSaved ? "default" : "outline"} className="w-full h-12 text-base" disabled={mutation.isPending}>
                    {isSaved ? (<><Heart className="mr-2 w-5 h-5 fill-current" /> Guardado</>) : (<><Heart className="mr-2 w-5 h-5" /> Guardar Dieta</>)}
                  </Button>
                </Card>
              );
            })}
          </TabsContent>
          <TabsContent value="saved" className="mt-6 space-y-4">
            {mySavedDiets.length > 0 ? (
              mySavedDiets.map((diet) => {
                const isActive = activeDietId === diet.id;
                return (
                  <Card key={diet.id} className={`p-6 transition-all duration-300 ${isActive ? "border-primary" : ""}`}>
                    <div className="cursor-pointer" onClick={() => setSelectedDiet(diet)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{diet.icon}</span>
                          <div>
                            <h3 className="text-foreground mb-1">{diet.name}</h3>
                            <p className="text-base text-muted-foreground">{diet.description}</p>
                          </div>
                        </div>
                        {isActive && <Badge>Activa</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={(e) => handleToggleSave(e, diet.id, diet.name)} variant="outline" className="w-full h-12 text-base" disabled={mutation.isPending}>
                        <Heart className="mr-2 w-5 h-5" /> Quitar
                      </Button>
                      <Button onClick={(e) => handleSetActive(e, diet.id)} disabled={isActive || mutation.isPending} className="w-full h-12 text-base">
                        {isActive ? (<><CheckCircle className="mr-2 w-5 h-5" /> En Curso</>) : (<><PlusCircle className="mr-2 w-5 h-5" /> Empezar</>)}
                      </Button>
                    </div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-border space-y-4">
                            <h4 className="font-semibold text-foreground text-lg">Ejemplo de menú diario</h4>
                            <MealPlanItem icon={Sunrise} meal="Desayuno" food={diet.sampleMealPlan.breakfast} />
                            <MealPlanItem icon={Sun} meal="Comida" food={diet.sampleMealPlan.lunch} />
                            <MealPlanItem icon={Coffee} meal="Merienda" food={diet.sampleMealPlan.snack} />
                            <MealPlanItem icon={Moon} meal="Cena" food={diet.sampleMealPlan.dinner} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No has guardado ninguna dieta.</p>
                <p className="text-sm text-muted-foreground">Ve a "Explorar" para encontrar una.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <DietDetailDrawer isOpen={!!selectedDiet} diet={selectedDiet} onClose={() => setSelectedDiet(null)} />
    </PageLayout>
  );
};

export default Diets;