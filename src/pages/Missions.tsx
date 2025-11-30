import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";
import { toast } from "sonner";

const missions = [
  {
    id: 1,
    title: "Beber 8 vasos de agua",
    description: "Mantente hidratado durante el día",
    points: 10,
    icon: "💧",
  },
  {
    id: 2,
    title: "Caminar 5000 pasos",
    description: "Muévete más durante el día",
    points: 15,
    icon: "👟",
  },
  {
    id: 3,
    title: "Comer 3 porciones de frutas",
    description: "Consume frutas frescas",
    points: 12,
    icon: "🍎",
  },
  {
    id: 4,
    title: "Hacer 10 minutos de ejercicio",
    description: "Dedica tiempo a tu salud física",
    points: 20,
    icon: "💪",
  },
  {
    id: 5,
    title: "Dormir 8 horas",
    description: "Descansa adecuadamente",
    points: 15,
    icon: "😴",
  },
];

const Missions = () => {
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);

  const handleToggleMission = (missionId: number, points: number) => {
    if (completedMissions.includes(missionId)) {
      setCompletedMissions(completedMissions.filter((id) => id !== missionId));
    } else {
      setCompletedMissions([...completedMissions, missionId]);
      toast.success(`¡Misión completada! +${points} puntos`, {
        icon: <Star className="text-primary" />,
      });
    }
  };

  const totalPoints = missions.reduce((sum, m) => sum + m.points, 0);
  const earnedPoints = missions
    .filter((m) => completedMissions.includes(m.id))
    .reduce((sum, m) => sum + m.points, 0);
  const progress = (earnedPoints / totalPoints) * 100;

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-primary">Misiones Saludables</h1>
          <p className="text-muted-foreground text-lg">
            Completa tus misiones diarias
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 animate-scale-in transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground mb-1">Progreso Diario</h3>
              <p className="text-3xl font-bold text-primary animate-bounce-in" style={{ animationDelay: "0.2s" }}>
                {earnedPoints}/{totalPoints}
              </p>
              <p className="text-sm text-muted-foreground">puntos</p>
            </div>
            <Trophy className="w-16 h-16 text-primary transition-transform duration-300 hover:scale-110 hover:rotate-12" />
          </div>
          <Progress value={progress} className="h-3 transition-all duration-500" />
        </Card>

        <div className="space-y-4">
          <h2 className="text-foreground animate-fade-in">Misiones de Hoy</h2>
          {missions.map((mission, i) => {
            const isCompleted = completedMissions.includes(mission.id);
            return (
              <Card
                key={mission.id}
                className={`p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up ${
                  isCompleted ? "bg-primary/5 border-primary/30" : ""
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() =>
                      handleToggleMission(mission.id, mission.points)
                    }
                    className="mt-1 w-6 h-6 transition-transform duration-300 hover:scale-110"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl transition-transform duration-300 hover:scale-125">{mission.icon}</span>
                        <h3
                          className={`text-foreground transition-all duration-300 ${
                            isCompleted ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {mission.title}
                        </h3>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary transition-transform duration-300 hover:scale-110">
                        +{mission.points}
                      </span>
                    </div>
                    <p
                      className={`text-base ${
                        isCompleted ? "text-muted-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {mission.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Missions;
