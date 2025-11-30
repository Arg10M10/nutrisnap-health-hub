import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface Step7Props {
  prev: () => void;
  finish: () => void;
}

const Step7 = ({ prev, finish }: Step7Props) => {
  return (
    <Card className="w-full text-center">
      <CardHeader>
        <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
        <CardTitle className="text-3xl">¡Todo listo!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          Has completado tu perfil. Estás a un paso de comenzar tu viaje hacia una vida más saludable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="ghost" onClick={prev} size="lg">Revisar mis datos</Button>
          <Button onClick={finish} size="lg">Finalizar y Empezar</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step7;