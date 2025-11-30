import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Clock, Flame, HeartPulse, PersonStanding, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "age" | "condition" | "results";
type Exercise = {
  name: string;
  duration: number;
  calories: number;
  intensity: string;
};

const ageGroups = [
  { range: "18-30", label: "18-30 años", icon: "💪" },
  { range: "31-50", label: "31-50 años", icon: "🏃" },
  { range: "51-65", label: "51-65 años", icon: "🚶" },
  { range: "65+", label: "65+ años", icon: "🧘" },
];

const conditions = [
  { id: "weight-loss", label: "Perder Peso", icon: Flame },
  { id: "muscle-gain", label: "Ganar Músculo", icon: Dumbbell },
  { id: "flexibility", label: "Más Flexibilidad", icon: PersonStanding },
  { id: "low-impact", label: "Bajo Impacto", icon: HeartPulse },
];

const exercises: Record<string, Record<string, Exercise[]>> = {
  "18-30": {
    "weight-loss": [
      { name: "Burpees", duration: 15, calories: 120, intensity: "Alta" },
      { name: "HIIT", duration: 20, calories: 250, intensity: "Alta" },
    ],
    "muscle-gain": [
      { name: "Flexiones", duration: 15, calories: 100, intensity: "Media" },
      { name: "Sentadillas con peso", duration: 20, calories: 150, intensity: "Alta" },
    ],
    "flexibility": [
      { name: "Yoga Dinámico", duration: 30, calories: 150, intensity: "Media" },
      { name: "Estiramientos profundos", duration: 20, calories: 60, intensity: "Baja" },
    ],
    "low-impact": [
      { name: "Natación", duration: 30, calories: 200, intensity: "Media" },
      { name: "Elíptica", duration: 25, calories: 180, intensity: "Media" },
    ],
  },
  "31-50": {
    "weight-loss": [
      { name: "Ciclismo", duration: 30, calories: 200, intensity: "Media" },
      { name: "Correr ligero", duration: 25, calories: 180, intensity: "Media" },
    ],
    "muscle-gain": [
      { name: "Remo", duration: 20, calories: 160, intensity: "Media" },
      { name: "Planchas y abdominales", duration: 15, calories: 90, intensity: "Media" },
    ],
    "flexibility": [
      { name: "Pilates", duration: 30, calories: 120, intensity: "Baja" },
      { name: "Tai Chi", duration: 25, calories: 100, intensity: "Baja" },
    ],
    "low-impact": [
      { name: "Caminata en pendiente", duration: 30, calories: 150, intensity: "Media" },
      { name: "Aqua-gym", duration: 25, calories: 130, intensity: "Baja" },
    ],
  },
  "51-65": {
    "weight-loss": [
      { name: "Caminata rápida", duration: 30, calories: 150, intensity: "Baja" },
      { name: "Baile de salón", duration: 40, calories: 180, intensity: "Baja" },
    ],
    "muscle-gain": [
      { name: "Ejercicios con bandas", duration: 20, calories: 80, intensity: "Baja" },
      { name: "Levantamiento de pesas ligeras", duration: 15, calories: 70, intensity: "Baja" },
    ],
    "flexibility": [
      { name: "Estiramientos suaves", duration: 20, calories: 50, intensity: "Muy Baja" },
      { name: "Yoga restaurativo", duration: 30, calories: 90, intensity: "Muy Baja" },
    ],
    "low-impact": [
      { name: "Caminar en el agua", duration: 25, calories: 100, intensity: "Muy Baja" },
      { name: "Bicicleta estática", duration: 20, calories: 110, intensity: "Baja" },
    ],
  },
  "65+": {
    "weight-loss": [
      { name: "Caminar", duration: 25, calories: 100, intensity: "Muy Baja" },
      { name: "Ejercicios en silla", duration: 20, calories: 60, intensity: "Muy Baja" },
    ],
    "muscle-gain": [
      { name: "Levantar botellas de agua", duration: 15, calories: 40, intensity: "Muy Baja" },
      { name: "Ejercicios de equilibrio", duration: 10, calories: 30, intensity: "Muy Baja" },
    ],
    "flexibility": [
      { name: "Estiramientos en silla", duration: 15, calories: 35, intensity: "Muy Baja" },
      { name: "Movilidad articular", duration: 20, calories: 45, intensity: "Muy Baja" },
    ],
    "low-impact": [
      { name: "Caminar lento", duration: 20, calories: 70, intensity: "Muy Baja" },
      { name: "Movimientos de Tai Chi", duration: 25, calories: 80, intensity: "Muy Baja" },
    ],
  },
};

const Exercises = () => {
  const [step, setStep] = useState<Step>("age");
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const handleSelectAge = (ageRange: string) => {
    setSelectedAge(ageRange);
    setStep("condition");
  };

  const handleSelectCondition = (conditionId: string) => {
    setSelectedCondition(conditionId);
    setStep("results");
  };

  const handleReset = () => {
    setStep("age");
    setSelectedAge(null);
    setSelectedCondition(null);
  };

  const renderStep = () => {
    switch (step) {
      case "age":
        return (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <h2 className="text-foreground text-center">Paso 1: Tu edad</h2>
            <div className="grid grid-cols-2 gap-4">
              {ageGroups.map((group) => (
                <Button
                  key={group.range}
                  variant="outline"
                  className="h-28 flex-col gap-2 text-base"
                  onClick={() => handleSelectAge(group.range)}
                >
                  <span className="text-4xl">{group.icon}</span>
                  {group.label}
                </Button>
              ))}
            </div>
          </div>
        );
      case "condition":
        return (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <h2 className="text-foreground text-center">Paso 2: Tu objetivo</h2>
            <div className="grid grid-cols-2 gap-4">
              {conditions.map((cond) => (
                <Button
                  key={cond.id}
                  variant="outline"
                  className="h-28 flex-col gap-2 text-base"
                  onClick={() => handleSelectCondition(cond.id)}
                >
                  <cond.icon className="w-10 h-10 text-primary" />
                  <span className="text-center">{cond.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );
      case "results":
        const recommended = (selectedAge && selectedCondition && exercises[selectedAge]?.[selectedCondition]) || [];
        return (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-foreground">Ejercicios para ti</h2>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Empezar de nuevo
              </Button>
            </div>
            {recommended.length > 0 ? (
              recommended.map((exercise, i) => (
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
              ))
            ) : (
              <p className="text-center text-muted-foreground">No se encontraron ejercicios. Inténtalo de nuevo.</p>
            )}
          </div>
        );
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Plan de Ejercicios</h1>
          <p className="text-muted-foreground text-lg">
            Encuentra la rutina perfecta para ti en dos simples pasos
          </p>
        </div>
        <Card className="p-6">{renderStep()}</Card>
      </div>
    </PageLayout>
  );
};

export default Exercises;