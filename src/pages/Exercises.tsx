import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dumbbell, Clock, Flame, HeartPulse, PersonStanding, RefreshCw, LoaderCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "age" | "condition" | "results";
type Exercise = {
  name: string;
  duration: number;
  calories: number;
  intensity: string;
};

const conditions = [
  { id: "Perder Peso", label: "Perder Peso", icon: Flame },
  { id: "Ganar Músculo", label: "Ganar Músculo", icon: Dumbbell },
  { id: "Más Flexibilidad", label: "Más Flexibilidad", icon: PersonStanding },
  { id: "Bajo Impacto", label: "Bajo Impacto", icon: HeartPulse },
];

const Exercises = () => {
  const [step, setStep] = useState<Step>("age");
  const [age, setAge] = useState(30);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const {
    mutate: generateExercises,
    data: recommendedExercises,
    isPending,
    isError,
  } = useMutation<Exercise[], Error, { age: number; objective: string }>({
    mutationFn: async ({ age, objective }) => {
      const { data, error } = await supabase.functions.invoke("generate-exercises", {
        body: { age, objective },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (!Array.isArray(data)) {
        throw new Error("La respuesta de la IA no tiene el formato esperado.");
      }

      return data;
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("No se pudo generar tu plan de ejercicios. Inténtalo de nuevo.");
    }
  }, [isError]);

  const handleAgeSubmit = () => {
    setStep("condition");
  };

  const handleSelectCondition = (conditionId: string) => {
    setSelectedCondition(conditionId);
    generateExercises({ age, objective: conditionId });
    setStep("results");
  };

  const handleReset = () => {
    setStep("age");
    setSelectedCondition(null);
    setAge(30);
  };

  const renderStep = () => {
    switch (step) {
      case "age":
        return (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-foreground">Paso 1: ¿Cuál es tu edad?</h2>
              <p className="text-muted-foreground">Desliza para seleccionar tu edad.</p>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <span className="text-6xl font-bold text-primary">{age}</span>
              <Slider
                defaultValue={[age]}
                max={80}
                min={18}
                step={1}
                onValueChange={(value) => setAge(value[0])}
                className="w-full max-w-sm"
              />
            </div>
            <Button onClick={handleAgeSubmit} className="w-full h-12 text-base">
              Siguiente
            </Button>
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
        return (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-foreground">Ejercicios para ti</h2>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Empezar de nuevo
              </Button>
            </div>
            {isPending && (
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Generando tu plan personalizado...</p>
              </div>
            )}
            {isError && (
               <p className="text-center text-destructive">Hubo un error. Por favor, intenta de nuevo.</p>
            )}
            {recommendedExercises &&
              recommendedExercises.map((exercise, i) => (
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
        );
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Plan de Ejercicios IA</h1>
          <p className="text-muted-foreground text-lg">
            Encuentra la rutina perfecta para ti generada por IA
          </p>
        </div>
        <Card className="p-6 min-h-[300px] flex items-center justify-center">{renderStep()}</Card>
      </div>
    </PageLayout>
  );
};

export default Exercises;