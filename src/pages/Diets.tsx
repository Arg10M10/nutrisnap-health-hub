import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Heart, Bookmark } from "lucide-react";
import { toast } from "sonner";

const diets = [
  {
    id: 1,
    name: "Mediterránea",
    description: "Rica en frutas, verduras, pescado y aceite de oliva",
    benefits: ["Salud cardiovascular", "Control de peso", "Longevidad"],
    icon: "🥗",
  },
  {
    id: 2,
    name: "Vegetariana",
    description: "Basada en plantas, sin carne ni pescado",
    benefits: ["Digestión saludable", "Menor colesterol", "Sostenible"],
    icon: "🥬",
  },
  {
    id: 3,
    name: "Baja en Sodio",
    description: "Reduce la sal para mejorar la presión arterial",
    benefits: ["Presión arterial", "Salud renal", "Menos retención"],
    icon: "🧂",
  },
  {
    id: 4,
    name: "Rica en Fibra",
    description: "Abundante en cereales integrales y vegetales",
    benefits: ["Digestión", "Control glucosa", "Saciedad"],
    icon: "🌾",
  },
  {
    id: 5,
    name: "Antiinflamatoria",
    description: "Alimentos que reducen la inflamación",
    benefits: ["Articulaciones", "Sistema inmune", "Energía"],
    icon: "🍓",
  },
];

const Diets = () => {
  const [savedDiets, setSavedDiets] = useState<number[]>([]);

  const handleToggleSave = (dietId: number, dietName: string) => {
    if (savedDiets.includes(dietId)) {
      setSavedDiets(savedDiets.filter((id) => id !== dietId));
      toast.success(`${dietName} eliminada de guardados`);
    } else {
      setSavedDiets([...savedDiets, dietId]);
      toast.success(`${dietName} guardada`, {
        icon: <Heart className="text-primary" />,
      });
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Tipos de Dietas</h1>
          <p className="text-muted-foreground text-lg">
            Descubre y guarda las dietas que más te convengan
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-6 h-6 text-secondary" />
            <h3 className="text-foreground">Mis Dietas Guardadas</h3>
          </div>
          <p className="text-2xl font-bold text-secondary">
            {savedDiets.length} {savedDiets.length === 1 ? "dieta" : "dietas"}
          </p>
        </Card>

        <div className="space-y-4">
          <h2 className="text-foreground">Explora Dietas</h2>
          {diets.map((diet) => {
            const isSaved = savedDiets.includes(diet.id);
            return (
              <Card key={diet.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{diet.icon}</span>
                    <div>
                      <h3 className="text-foreground mb-1">{diet.name}</h3>
                      <p className="text-base text-muted-foreground">
                        {diet.description}
                      </p>
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
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleToggleSave(diet.id, diet.name)}
                  variant={isSaved ? "default" : "outline"}
                  className="w-full h-12 text-base"
                >
                  {isSaved ? (
                    <>
                      <Heart className="mr-2 w-5 h-5 fill-current" />
                      Guardado
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 w-5 h-5" />
                      Guardar Dieta
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Diets;
