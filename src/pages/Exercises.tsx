import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exercises, Exercise } from "@/data/exercises";
import ExerciseDetailDrawer from "@/components/ExerciseDetailDrawer";
import { useAuth } from "@/context/AuthContext";
import { Loader2, User, RefreshCw } from "lucide-react";

const Exercises = () => {
  const { profile, loading } = useAuth();
  const [age, setAge] = useState<number | null>(null);
  const [showSlider, setShowSlider] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (profile?.age) {
      setAge(profile.age);
    }
  }, [profile]);

  if (loading || age === null) {
    return (
      <PageLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  const recommendedExercises = exercises.filter(
    (exercise) => age >= exercise.minAge && age <= exercise.maxAge
  );

  const handleResetAge = () => {
    if (profile?.age) {
      setAge(profile.age);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Plan de Ejercicios</h1>
          <p className="text-muted-foreground text-lg">
            Descubre tu rutina semanal ideal basada en tu edad
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-foreground flex items-center gap-2">
                <User className="w-6 h-6" />
                {showSlider ? "Explorando edad" : "Tu edad"}
              </h2>
              <span className="text-4xl font-bold text-primary">{age}</span>
            </div>
            
            {showSlider ? (
              <div className="space-y-4 pt-2">
                <Slider
                  value={[age]}
                  max={80}
                  min={6}
                  step={1}
                  onValueChange={(value) => setAge(value[0])}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button onClick={handleResetAge} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Restablecer a mi edad
                  </Button>
                   <Button onClick={() => setShowSlider(false)} className="w-full">
                    Ocultar
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowSlider(true)} variant="secondary" className="w-full">
                Explorar otras edades
              </Button>
            )}
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