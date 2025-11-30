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
        <div className="text-center space-y-2">
          <h1 className="text-primary">Escanear Comida</h1>
          <p className="text-muted-foreground text-lg">
            Apunta la cámara a tu comida para obtener información nutricional
          </p>
        </div>

        <Card className="aspect-square bg-muted rounded-3xl flex items-center justify-center overflow-hidden relative">
          {isScanning ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-pulse">
                <Scan className="w-32 h-32 text-primary" />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Camera className="w-32 h-32 text-muted-foreground mx-auto" />
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
          className="w-full h-16 text-lg rounded-2xl"
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

        <Card className="p-6 space-y-4">
          <h3 className="text-foreground">Últimos Escaneos</h3>
          <div className="space-y-3">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay escaneos recientes.</p>
              <p className="text-sm text-muted-foreground">Usa el escáner para empezar.</p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Scanner;