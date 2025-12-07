import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres.").max(100),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(500),
});

interface NewFeatureRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewFeatureRequestDrawer = ({ isOpen, onClose }: NewFeatureRequestDrawerProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { error } = await supabase.from('feature_requests').insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature_requests'] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error(t('new_request_drawer.toast_error'), { description: error.message });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('new_request_drawer.title')}</DrawerTitle>
          <DrawerDescription>{t('new_request_drawer.description')}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('new_request_drawer.title_label')}</FormLabel>
                  <FormControl><Input {...field} placeholder={t('new_request_drawer.title_placeholder')} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('new_request_drawer.desc_label')}</FormLabel>
                  <FormControl><Textarea {...field} rows={5} placeholder={t('new_request_drawer.desc_placeholder')} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DrawerFooter className="flex-row gap-2 px-0">
                <Button type="submit" size="lg" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('new_request_drawer.submit_button')}
                </Button>
                <DrawerClose asChild><Button variant="outline" size="lg" className="flex-1">{t('new_request_drawer.cancel_button')}</Button></DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewFeatureRequestDrawer;