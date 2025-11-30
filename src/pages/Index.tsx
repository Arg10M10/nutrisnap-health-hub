import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Dumbbell, Target, Book, Leaf, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Escanear Comida",
      description: "Analiza tu comida al instante",
      icon: Camera,
      path: "/scanner",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Ejercicios",
      description: "Rutinas personalizadas",
      icon: Dumbbell,
      path: "/exercises",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Misiones",
      description: "Completa tus objetivos",
      icon: Target,
      path: "/missions",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Dietas",
      description: "Planes alimenticios",
      icon: Book,
      path: "/diets",
      color: "bg-primary/10 text-primary",
    },
  ];

  const stats = [
    { label: "Calorías Hoy", value: "1,450", icon: TrendingUp },
    { label: "Misiones", value: "3/5", icon: Target },
    { label: "Racha", value: "7 días", icon: Leaf },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-10 h-10 text-primary" />
            <h1 className="text-primary">NutriSnap</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Tu compañero de salud diario
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <Card key={i} className="p-4 text-center">
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-foreground">Acciones Rápidas</h2>
          <div className="grid gap-4">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-auto p-0 overflow-hidden"
                onClick={() => navigate(action.path)}
              >
                <Card className="w-full p-6 border-0 shadow-none hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${action.color}`}>
                      <action.icon className="w-8 h-8" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-foreground mb-1">{action.title}</h3>
                      <p className="text-base text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Button>
            ))}
          </div>
        </div>

        {/* Daily Tip */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="text-foreground mb-2">Consejo del Día</h3>
              <p className="text-base text-muted-foreground">
                Bebe un vaso de agua al despertar para activar tu metabolismo y mejorar tu digestión.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Index;
