import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exercises, Exercise } from "@/data/exercises";
import ExerciseDetailDrawer from "@/components/ExerciseDetailDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Exercises = () => {
  const { profile, loading } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const age = profile?.age;
  const recommendedExercises = age
    ? exercises.filter((exercise) => age >= exercise.minAge && age <= exercise.maxAge)
    : [];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Plan de Ejercicios</h1>
          <p className="text-muted-foreground text-lg">
            Tu rutina semanal ideal basada en tu perfil
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-foreground">Ejercicios para ti</h2>
              {loading ? (
                <Skeleton className="h-10 w-16 rounded-md" />
              ) : (
                <span className="text-4xl font-bold text-primary">{age}</span>
              )}
            </div>
            <p className="text-muted-foreground">Recomendaciones basadas en tu edad.</p>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : recommendedExercises.length > 0 ? (
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
                No se encontraron ejercicios para tu edad.
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