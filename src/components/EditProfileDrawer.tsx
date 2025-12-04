import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { differenceInYears } from 'date-fns';

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

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  gender: z.string().min(1, "Gender is required."),
  date_of_birth: z.string().min(1, "Date of birth is required."),
  goal: z.string().min(1, "Goal is required."),
  height: z.coerce.number().min(1, "Height is required."),
  weight: z.coerce.number().min(1, "Weight is required."),
  previous_apps_experience: z.string().min(1, "Experience is required."),
});

interface EditProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileDrawer = ({ isOpen, onClose }: EditProfileDrawerProps) => {
  const { profile, user, refetchProfile } = useAuth();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      const [firstName, ...lastNameParts] = profile.full_name?.split(' ') || ['', ''];
      form.reset({
        firstName: firstName,
        lastName: lastNameParts.join(' '),
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth || '',
        goal: profile.goal || '',
        height: profile.height || 0,
        weight: profile.weight || 0,
        previous_apps_experience: profile.previous_apps_experience || '',
      });
    }
  }, [profile, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      if (!user) throw new Error('User not found');
      
      const age = differenceInYears(new Date(), new Date(values.date_of_birth));

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: `${values.firstName} ${values.lastName}`,
          gender: values.gender,
          date_of_birth: values.date_of_birth,
          age: age,
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
      toast.success('Profile updated successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('There was an error updating your profile.', { description: error.message });
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Profile</DrawerTitle>
          <DrawerDescription>Make the changes you need and save them.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="goal" render={({ field }) => (
                <FormItem><FormLabel>Main Goal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select your goal" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose weight</SelectItem>
                    <SelectItem value="maintain_weight">Maintain weight</SelectItem>
                    <SelectItem value="gain_weight">Gain weight</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="previous_apps_experience" render={({ field }) => (
                <FormItem><FormLabel>Previous Experience</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select your experience" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Yes, I've used several">Yes, I've used several</SelectItem>
                    <SelectItem value="Yes, one or two">Yes, one or two</SelectItem>
                    <SelectItem value="No, this is my first time">No, this is my first time</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <DrawerFooter className="flex-row gap-2 px-0">
                <Button type="submit" size="lg" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <DrawerClose asChild><Button variant="outline" size="lg" className="flex-1">Cancel</Button></DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditProfileDrawer;