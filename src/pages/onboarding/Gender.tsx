import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const GenderStep = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const updateUserProfile = async ({ gender }: { gender: string }) => {
    if (!user) throw new Error('User not found');
    const { error } = await supabase
      .from('profiles')
      .update({ gender: gender, onboarding_completed: true }) // Mark as completed for now
      .eq('id', user.id);

    if (error) throw error;
  };

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success('¡Genial! Perfil actualizado.');
      // In a real multi-step flow, you'd navigate to the next step.
      // For now, we'll reload to let the AuthProvider redirect to the main app.
      window.location.reload();
    },
    onError: (error) => {
      toast.error('Hubo un error al guardar tu selección.');
      console.error(error);
    },
  });

  const handleContinue = () => {
    if (selectedGender) {
      mutation.mutate({ gender: selectedGender });
    } else {
      toast.warning('Por favor, selecciona una opción.');
    }
  };

  const genderOptions = ['Femenino', 'Masculino', 'Prefiero no decirlo'];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <p className="text-lg font-semibold text-primary">Paso 1 de 5</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            ¿Cuál es tu género?
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Esto nos ayuda a personalizar tus metas y recomendaciones.
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-4">
            {genderOptions.map((gender) => (
              <Button
                key={gender}
                variant="outline"
                size="lg"
                className={cn(
                  'w-full h-14 text-lg',
                  selectedGender === gender && 'border-primary ring-2 ring-primary'
                )}
                onClick={() => setSelectedGender(gender)}
              >
                {gender}
              </Button>
            ))}
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full h-14 text-lg"
          onClick={handleContinue}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </div>
  );
};

export default GenderStep;