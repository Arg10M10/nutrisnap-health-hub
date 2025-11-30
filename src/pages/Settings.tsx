import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Link to="/" className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-primary">Configuración</h1>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Edita tu información personal y preferencias.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Esta función estará disponible próximamente.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Gestiona cómo y cuándo te contactamos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Ajustes de notificaciones estarán aquí.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Acerca de NutriSnap</CardTitle>
            <CardDescription>Información sobre la aplicación.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Versión 1.0.0</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;