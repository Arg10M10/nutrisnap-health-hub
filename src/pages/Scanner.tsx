import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Scan, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success("¡Comida escaneada!", {
        description: "Manzana detectada - 95 calorías",
        icon: <CheckCircle className="text-primary" />,
      });
    }, 2000);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-primary">Escanear Comida</h1>
          <p className="text-muted-foreground text-lg">
            Apunta la cámara a tu comida para obtener información nutricional
          </p>
        </div>

        <Card className="aspect-square bg-muted rounded-3xl flex items-center justify-center overflow-hidden relative animate-scale-in transition-all duration-300 hover:shadow-xl">
          {isScanning ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-fade-in">
              <div className="animate-pulse-soft">
                <Scan className="w-32 h-32 text-primary" />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Camera className="w-32 h-32 text-muted-foreground mx-auto transition-transform duration-300 hover:scale-110" />
              <p className="text-muted-foreground text-lg font-medium">
                Presiona el botón para escanear
              </p>
            </div>
          )}
        </Card>

        <Button
          onClick={handleScan}
          disabled={isScanning}
          size="lg"
          className="w-full h-16 text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {isScanning ? (
            "Escaneando..."
          ) : (
            <>
              <Camera className="mr-2 w-6 h-6" />
              Escanear Comida
            </>
          )}
        </Button>

        <Card className="p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-foreground">Últimos Escaneos</h3>
          <div className="space-y-3">
            {[
              { name: "Manzana", calories: 95, time: "Hace 2h" },
              { name: "Ensalada", calories: 150, time: "Ayer" },
              { name: "Pollo asado", calories: 285, time: "Hace 2 días" },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex justify-between items-center p-4 bg-muted rounded-xl animate-slide-in-right transition-all duration-300 hover:bg-muted/70 hover:scale-[1.02] hover:shadow-md"
                style={{ animationDelay: `${(i + 4) * 0.1}s` }}
              >
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{item.calories}</p>
                  <p className="text-xs text-muted-foreground">calorías</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Scanner;
