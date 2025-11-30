import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Clock, Flame } from "lucide-react";

const ageGroups = [
  { range: "18-30", label: "18-30 años", icon: "💪" },
  { range: "31-50", label: "31-50 años", icon: "🏃" },
  { range: "51-65", label: "51-65 años", icon: "🚶" },
  { range: "65+", label: "65+ años", icon: "🧘" },
];

const exercises = {
  "18-30": [
    { name: "Burpees", duration: 15, calories: 120, intensity: "Alta" },
    { name: "Sentadillas con salto", duration: 12, calories: 95, intensity: "Alta" },
    { name: "Plancha", duration: 10, calories: 70, intensity: "Media" },
  ],
  "31-50": [
    { name: "Caminar rápido", duration: 30, calories: 150, intensity: "Media" },
    { name: "Yoga", duration: 20, calories: 80, intensity: "Baja" },
    { name: "Sentadillas", duration: 15, calories: 100, intensity: "Media" },
  ],
  "51-65": [
    { name: "Caminar", duration: 25, calories: 100, intensity: "Baja" },
    { name: "Estiramientos", duration: 15, calories: 50, intensity: "Baja" },
    { name: "Ejercicios de equilibrio", duration: 10, calories: 40, intensity: "Baja" },
  ],
  "65+": [
    { name: "Caminar suave", duration: 20, calories: 70, intensity: "Muy Baja" },
    { name: "Estiramientos sentado", duration: 15, calories: 35, intensity: "Muy Baja" },
    { name: "Ejercicios de brazos", duration: 10, calories: 45, intensity: "Baja" },
  ],
};

const Exercises = () => {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Ejercicios</h1>
          <p className="text-muted-foreground text-lg">
            Selecciona tu grupo de edad para ver ejercicios recomendados
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {ageGroups.map((group) => (
            <Button
              key={group.range}
              variant={selectedAge === group.range ? "default" : "outline"}
              className="h-24 flex-col gap-2 text-base"
              onClick={() => setSelectedAge(group.range)}
            >
              <span className="text-3xl">{group.icon}</span>
              {group.label}
            </Button>
          ))}
        </div>

        {selectedAge && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <h2 className="text-foreground">Ejercicios Recomendados</h2>
            {exercises[selectedAge as keyof typeof exercises].map((exercise, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-foreground mb-2">{exercise.name}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      {exercise.intensity}
                    </span>
                  </div>
                  <Dumbbell className="w-8 h-8 text-primary" />
                </div>
                <div className="flex gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-base">{exercise.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    <span className="text-base">{exercise.calories} cal</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Exercises;
