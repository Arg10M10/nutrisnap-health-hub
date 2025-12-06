import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { differenceInYears } from 'date-fns';
import { useTranslation } from 'react-i18next';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import DatePicker from '@/components/DatePicker';

const EditProfileDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
  const { profile, user, refetchProfile } = useAuth();
  const { t } = useTranslation();

  const profileSchema = z.object({
    gender: z.string().min(1, t('zod.gender_required')),
    date_of_birth: z.date({ required_error: t('zod.dob_required') }),
    goal: z.string().min(1, t('zod.goal_required')),
    height: z.coerce.number().min(1, t('zod.height_required')),
    weight: z.coerce.number().min(1, t('zod.weight_required')),
    previous_apps_experience: z.string().min(1, t('zod.experience_required')),
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile && isOpen) {
      form.reset({
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date('2000-01-01'),
        goal: profile.goal || '',
        height: profile.height || 0,
        weight: profile.weight || 0,
        previous_apps_experience: profile.previous_apps_experience || '',
      });
    }
  }, [profile, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error('User not found');
      
      const isoDate = values.date_of_birth.toISOString().split('T')[0];
      const age = differenceInYears(new Date(), values.date_of_birth);

      const { error } = await supabase
        .from('profiles')
        .update({
          gender: values.gender,
          date_of_birth: isoDate,
          age,
          goal: values.goal,
          units: 'metric',
          height: values.height,
          weight: values.weight,
          previous_apps_experience: values.previous_apps_experience,
        })
        .eq('id', user.id);
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

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('edit_profile.title')}</DrawerTitle>
          <DrawerDescription>{t('edit_profile.description')}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('edit_profile.dob')}</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('edit_profile.dob')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('edit_profile.gender')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('edit_profile.gender_placeholder')} />
                        </SelectTrigger>
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
              </div>

              <FormField control={form.control} name="goal" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('edit_profile.goal')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('edit_profile.goal_placeholder')} />
                      </SelectTrigger>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('edit_profile.height')}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('edit_profile.weight')}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="previous_apps_experience" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('edit_profile.experience')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('edit_profile.experience_placeholder')} />
                      </SelectTrigger>
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

export default EditProfileDrawer;