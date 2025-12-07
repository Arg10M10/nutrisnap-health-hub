import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  gender: z.string().min(1, 'Gender is required.'),
  goal: z.string().min(1, 'Goal is required.'),
  previous_apps_experience: z.string().min(1, 'Experience is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCategoricalDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditCategoricalDetailsDrawer = ({ isOpen, onClose }: EditCategoricalDetailsDrawerProps) => {
  const { profile, user, refetchProfile } = useAuth();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (profile && isOpen) {
      form.reset({
        gender: profile.gender || '',
        goal: profile.goal || '',
        previous_apps_experience: profile.previous_apps_experience || '',
      });
    }
  }, [profile, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error('User not found');
      const { error } = await supabase.from('profiles').update(values).eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      toast.success(t('edit_profile.toast_success'));
      onClose();
    },
    onError: (error) => {
      toast.error(t('edit_profile.toast_error'), { description: (error as Error).message });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('settings.account.personalDetails')}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('edit_profile.gender')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={t('edit_profile.gender_placeholder')} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Female">{t('edit_profile.gender_female')}</SelectItem>
                      <SelectItem value="Male">{t('edit_profile.gender_male')}</SelectItem>
                      <SelectItem value="Prefer not to say">{t('edit_profile.gender_not_say')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="goal" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('edit_profile.goal')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={t('edit_profile.goal_placeholder')} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lose_weight">{t('edit_profile.goal_lose')}</SelectItem>
                      <SelectItem value="maintain_weight">{t('edit_profile.goal_maintain')}</SelectItem>
                      <SelectItem value="gain_weight">{t('edit_profile.goal_gain')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="previous_apps_experience" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('edit_profile.experience')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={t('edit_profile.experience_placeholder')} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yes, I've used several">{t('edit_profile.experience_several')}</SelectItem>
                      <SelectItem value="Yes, one or two">{t('edit_profile.experience_one_or_two')}</SelectItem>
                      <SelectItem value="No, this is my first time">{t('edit_profile.experience_first_time')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <DrawerFooter className="flex-row gap-2 px-0 pt-4">
                <Button type="submit" size="lg" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('edit_profile.save')}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" size="lg" className="flex-1">
                    {t('edit_profile.cancel')}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditCategoricalDetailsDrawer;