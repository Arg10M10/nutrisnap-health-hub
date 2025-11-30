import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { exercises, Exercise } from "@/data/exercises";
import ExerciseDetailDrawer from "@/components/ExerciseDetailDrawer";

const Exercises = () => {
  const [age, setAge] = useState(30);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const recommendedExercises = exercises.filter(
    (exercise) => age >= exercise.minAge && age <= exercise.maxAge
  );

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Plan de Ejercicios</h1>
          <p className="text-muted-foreground text-lg">
            Ajusta tu edad y descubre tu rutina semanal ideal
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-foreground">¿Cuál es tu edad?</h2>
              <span className="text-4xl font-bold text-primary">{age}</span>
            </div>
            <Slider
              defaultValue={[age]}
              max={80}
              min={6}
              step={1}
              onValueChange={(value) => setAge(value[0])}
              className="w-full"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-foreground">Ejercicios Recomendados</h3>
            {recommendedExercises.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendedExercises.map((exercise, i) => (
                  <Card 
                    key={i} 
                    className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <exercise.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                          <Badge variant="outline">{exercise.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No se encontraron ejercicios para esta edad.
              </p>
            )}
          </div>
        </Card>
      </div>
      <ExerciseDetailDrawer 
        isOpen={!!selectedExercise} 
        exercise={selectedExercise} 
        onClose={() => setSelectedExercise(null)} 
      />
    </PageLayout>
  );
};

export default Exercises;