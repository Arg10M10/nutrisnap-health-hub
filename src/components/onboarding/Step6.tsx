import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

const formSchema = z.object({
  ai_scanner: z.boolean().default(true),
  smart_reminders: z.boolean().default(true),
  personalized_recommendations: z.boolean().default(true),
});

interface Step6Props {
  data: { app_preferences: Partial<z.infer<typeof formSchema>> };
  update: (data: { app_preferences: Partial<z.infer<typeof formSchema>> }) => void;
  next: () => void;
  prev: () => void;
}

const Step6 = ({ data, update, next, prev }: Step6Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data.app_preferences,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    update({ app_preferences: values });
    next();
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <Settings className="mx-auto w-12 h-12 text-primary mb-4" />
        <CardTitle>Preferencias de la App</CardTitle>
        <CardDescription>Configura la app a tu gusto.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ai_scanner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Activar escáner con IA</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smart_reminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Recordatorios inteligentes</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalized_recommendations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Recomendaciones personalizadas</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={prev}>Atrás</Button>
              <Button type="submit">Siguiente</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Step6;