import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  User, Edit, HeartPulse, SlidersHorizontal, Languages, Target, Goal, Palette,
  Lightbulb, Mail, FileText, Shield, Instagram, LogOut, Trash2
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import EditProfileDrawer from "@/components/EditProfileDrawer";
import PageLayout from "@/components/PageLayout";
import { SettingsCategory } from "@/components/settings/SettingsCategory";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { LanguageDrawer } from "@/components/settings/LanguageDrawer";
import { TikTokIcon } from "@/components/icons/TikTokIcon";

const Settings = () => {
  const { profile, signOut } = useAuth();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Has cerrado sesión.");
  };

  const handleNotImplemented = () => {
    toast.info("Próximamente", { description: "Esta función estará disponible pronto." });
  };

  const handleDeleteAccount = () => {
    // Placeholder for account deletion logic
    toast.error("Función no implementada.", {
      description: "La eliminación de la cuenta se activará en el futuro.",
    });
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-primary">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-lg">
            Gestiona tu perfil y preferencias de la aplicación.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 bg-card border rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{profile?.full_name || "Usuario"}</p>
              <p className="text-sm text-muted-foreground">Ver y editar perfil</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditDrawerOpen(true)}>
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        {/* Account Category */}
        <SettingsCategory title="Cuenta">
          <SettingsItem icon={<HeartPulse size={20} />} label="Detalles Personales" onClick={() => setIsEditDrawerOpen(true)} />
          <SettingsItem icon={<SlidersHorizontal size={20} />} label="Preferencias" onClick={() => navigate('/settings/preferences')} />
          <SettingsItem icon={<Languages size={20} />} label={t('settings.language')} onClick={() => setIsLanguageDrawerOpen(true)} />
        </SettingsCategory>

        {/* Goals and Tracking Category */}
        <SettingsCategory title="Metas y seguimiento">
          <SettingsItem icon={<Target size={20} />} label="Editar objetos nutricionales" onClick={handleNotImplemented} />
          <SettingsItem icon={<Goal size={20} />} label="Objetivos y peso actual" onClick={handleNotImplemented} />
          <SettingsItem icon={<Palette size={20} />} label="Colores de Anillos" onClick={handleNotImplemented} />
        </SettingsCategory>

        {/* Support and Legal Category */}
        <SettingsCategory title="Soporte y Legal">
          <SettingsItem icon={<Lightbulb size={20} />} label="Solicitar función" onClick={handleNotImplemented} />
          <SettingsItem icon={<Mail size={20} />} label="Correo de soporte" onClick={handleNotImplemented} />
          <SettingsItem icon={<FileText size={20} />} label="Términos y condiciones" onClick={handleNotImplemented} />
          <SettingsItem icon={<Shield size={20} />} label="Política de privacidad" onClick={handleNotImplemented} />
        </SettingsCategory>

        {/* Social Media Category */}
        <SettingsCategory title="Redes Sociales">
          <SettingsItem icon={<Instagram size={20} />} label="Instagram" onClick={handleNotImplemented} />
          <SettingsItem icon={<TikTokIcon />} label="TikTok" onClick={handleNotImplemented} />
        </SettingsCategory>

        {/* Account Actions Category */}
        <SettingsCategory title="Acciones de Cuenta">
          <SettingsItem icon={<LogOut size={20} />} label="Cerrar sesión" onClick={handleSignOut} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full">
                <SettingsItem icon={<Trash2 size={20} />} label="Eliminar la cuenta" onClick={() => {}} destructive />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y tus datos de nuestros servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sí, eliminar cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SettingsCategory>

      </div>
      <EditProfileDrawer isOpen={isEditDrawerOpen} onClose={() => setIsEditDrawerOpen(false)} />
      <LanguageDrawer isOpen={isLanguageDrawerOpen} onClose={() => setIsLanguageDrawerOpen(false)} />
    </PageLayout>
  );
};

export default Settings;