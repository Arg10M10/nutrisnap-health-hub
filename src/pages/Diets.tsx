import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, Bookmark, PlusCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { diets, Diet } from "@/data/diets";
import DietDetailDrawer from "@/components/DietDetailDrawer";

const Diets = () => {
  const [savedDiets, setSavedDiets] = useState<number[]>([]);
  const [activeDietId, setActiveDietId] = useState<number | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<Diet | null>(null);

  const handleToggleSave = (e: React.MouseEvent, dietId: number, dietName: string) => {
    e.stopPropagation();
    if (savedDiets.includes(dietId)) {
      setSavedDiets(savedDiets.filter((id) => id !== dietId));
      toast.success(`${dietName} eliminada de tus dietas`);
      if (activeDietId === dietId) {
        setActiveDietId(null);
      }
    } else {
      setSavedDiets([...savedDiets, dietId]);
      toast.success(`${dietName} guardada`, {
        icon: <Heart className="text-primary" />,
      });
    }
  };

  const handleSetActive = (e: React.MouseEvent, dietId: number) => {
    e.stopPropagation();
    const diet = diets.find((d) => d.id === dietId);
    if (diet) {
      setActiveDietId(dietId);
      setSelectedDiet(diet); // <-- This line opens the drawer automatically
      toast.success(`¡Has empezado la dieta ${diet.name}!`, {
        icon: <CheckCircle className="text-primary" />,
      });
    }
  };

  const mySavedDiets = diets.filter((diet) => savedDiets.includes(diet.id));
  const activeDiet = diets.find((diet) => diet.id === activeDietId);

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
                  <Button onClick={(e) => handleToggleSave(e, diet.id, diet.name)} variant={isSaved ? "default" : "outline"} className="w-full h-12 text-base">
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
                  <Card key={diet.id} className={`p-6 cursor-pointer hover:border-primary/50 transition-colors ${isActive ? "border-primary" : ""}`} onClick={() => setSelectedDiet(diet)}>
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
                    <div className="flex gap-2">
                      <Button onClick={(e) => handleToggleSave(e, diet.id, diet.name)} variant="outline" className="w-full h-12 text-base">
                        <Heart className="mr-2 w-5 h-5" /> Quitar
                      </Button>
                      <Button onClick={(e) => handleSetActive(e, diet.id)} disabled={isActive} className="w-full h-12 text-base">
                        {isActive ? (<><CheckCircle className="mr-2 w-5 h-5" /> En Curso</>) : (<><PlusCircle className="mr-2 w-5 h-5" /> Empezar</>)}
                      </Button>
                    </div>
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