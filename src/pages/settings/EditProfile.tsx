import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const profileSchema = z.object({
  fullName: z.string().min(2, "El nombre es requerido."),
});

const colorOptions = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

const EditProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, user, refetchProfile } = useAuth();
  const [selectedColor, setSelectedColor] = useState(profile?.avatar_color || colorOptions[7]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || '',
      });
      setSelectedColor(profile.avatar_color || colorOptions[7]);
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      if (!user) throw new Error('Usuario no encontrado');
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          avatar_color: selectedColor,
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      navigate(-1);
    },
    onError: (error) => {
      toast.error(t('edit_profile.toast_error'), { description: error.message });
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    mutation.mutate(values);
  };

  // Watch current name for preview
  const currentName = form.watch('fullName');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 pt-8 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">{t('edit_profile.title')}</h1>
      </header>
      <main className="flex-1 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-center gap-6">
              <UserAvatar name={currentName || profile?.full_name} color={selectedColor} className="w-32 h-32 text-7xl" />
              <div className="flex flex-wrap justify-center gap-3">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-10 h-10 rounded-full transition-transform active:scale-90"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check className="w-6 h-6 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('edit_profile.full_name', 'Nombre Completo')}</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12 text-lg" placeholder="Tu nombre" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('edit_profile.save')}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default EditProfile;