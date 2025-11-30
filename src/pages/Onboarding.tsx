import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    goals: [] as string[],
  });

  const totalSteps = 4;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalsChange = (value: string[]) => {
    setFormData((prev) => ({ ...prev, goals: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setLoading(false);
    if (error) {
      toast.error('Hubo un error al guardar tu perfil.');
      console.error(error);
    } else {
      toast.success('¡Perfil completado! Bienvenido a NutriSnap.');
      // This will trigger a profile refresh in AuthContext and AuthGuard will redirect
      window.location.href = '/';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Ej: Ana García" />
            <Label htmlFor="age">Edad</Label>
            <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Ej: 28" />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="Ej: 65.5" />
            <Label htmlFor="height">Estatura (cm)</Label>
            <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} placeholder="Ej: 170" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Label>Género</Label>
            <Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender}>
              <SelectTrigger><SelectValue placeholder="Selecciona tu género" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Femenino</SelectItem>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Label>¿Cuáles son tus objetivos?</Label>
            <p className="text-sm text-muted-foreground">Puedes seleccionar varios.</p>
            <ToggleGroup type="multiple" variant="outline" onValueChange={handleGoalsChange} value={formData.goals} className="flex-wrap justify-start">
              <ToggleGroupItem value="perder-peso">Perder Peso</ToggleGroupItem>
              <ToggleGroupItem value="ganar-musculo">Ganar Músculo</ToggleGroupItem>
              <ToggleGroupItem value="comer-saludable">Comer Saludable</ToggleGroupItem>
              <ToggleGroupItem value="mantenerse-activo">Mantenerse Activo</ToggleGroupItem>
              <ToggleGroupItem value="reducir-estres">Reducir Estrés</ToggleGroupItem>
            </ToggleGroup>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>¡Bienvenido a NutriSnap!</CardTitle>
          <CardDescription>Completemos tu perfil para personalizar tu experiencia.</CardDescription>
          <Progress value={(step / totalSteps) * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {renderStep()}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>Atrás</Button>
              {step < totalSteps ? (
                <Button onClick={handleNext}>Siguiente</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;