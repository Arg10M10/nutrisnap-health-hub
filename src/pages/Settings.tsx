import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EditProfileDrawer from "@/components/EditProfileDrawer";

const ProfileItem = ({ label, value }: { label: string, value: string | number | null | undefined }) => (
  <div className="flex justify-between items-center border-b py-3">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-foreground text-right">{value || 'No especificado'}</p>
  </div>
);

const Settings = () => {
  const { profile, loading } = useAuth();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const goalLabels: { [key: string]: string } = {
    lose_weight: 'Perder peso',
    maintain_weight: 'Mantener peso',
    gain_weight: 'Ganar peso',
  };

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
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Tu Perfil</CardTitle>
              <CardDescription>Esta es la información que nos proporcionaste.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsEditDrawerOpen(true)}>
              <Edit className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : profile ? (
              <div className="space-y-2">
                <ProfileItem label="Nombre Completo" value={profile.full_name} />
                <ProfileItem label="Género" value={profile.gender} />
                <ProfileItem label="Edad" value={profile.age} />
                <ProfileItem label="Fecha de Nacimiento" value={profile.date_of_birth ? format(new Date(profile.date_of_birth), 'PPP', { locale: es }) : 'No especificado'} />
                <ProfileItem label="Objetivo Principal" value={profile.goal ? goalLabels[profile.goal] : 'No especificado'} />
                <ProfileItem label="Altura" value={`${profile.height || 'N/A'} ${profile.units === 'metric' ? 'cm' : 'in'}`} />
                <ProfileItem label="Peso" value={`${profile.weight || 'N/A'} ${profile.units === 'metric' ? 'kg' : 'lbs'}`} />
                <ProfileItem label="Experiencia previa" value={profile.previous_apps_experience} />
              </div>
            ) : (
              <p className="text-muted-foreground">No se pudo cargar la información del perfil.</p>
            )}
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
      <EditProfileDrawer isOpen={isEditDrawerOpen} onClose={() => setIsEditDrawerOpen(false)} />
    </div>
  );
};

export default Settings;