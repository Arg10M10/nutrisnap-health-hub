import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNutrition } from '@/context/NutritionContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Utensils, Loader2 } from 'lucide-react';
import { AnalysisResult } from './FoodAnalysisCard';

const formSchema = z.object({
  foodName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().optional(),
  portionSize: z.enum(['small', 'medium', 'large'], {
    required_error: 'You must select a portion size.',
  }),
});

const ManualFoodEntry = () => {
  const { addAnalysis } = useNutrition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: '',
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data, error } = await supabase.functions.invoke('analyze-text-food', {
        body: values,
      });
      if (error) throw new Error(error.message);
      return data as AnalysisResult;
    },
    onSuccess: (data) => {
      addAnalysis(data);
      toast.success('Analysis complete and added to diary.');
      form.reset();
    },
    onError: (error) => {
      toast.error('Error in analysis', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          Add Food Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Caesar salad with chicken" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add details to help the AI (ingredients, cooking method, etc.)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portionSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portion Size</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="w-full grid grid-cols-3"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <ToggleGroupItem value="small" className="h-12">Small</ToggleGroupItem>
                      <ToggleGroupItem value="medium" className="h-12">Medium</ToggleGroupItem>
                      <ToggleGroupItem value="large" className="h-12">Large</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze and Add
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ManualFoodEntry;