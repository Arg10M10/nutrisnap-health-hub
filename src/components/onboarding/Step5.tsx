import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Droplets, Bed } from "lucide-react";

const formSchema = z.object({
  water_intake: z.coerce.number().min(0, "El valor debe ser positivo.").max(10, "El valor parece muy alto."),
  sleep_hours: z.coerce.number().min(0, "El valor debe ser positivo.").max(16, "El valor parece muy alto."),
});

interface Step5Props {
  data: Partial<z.infer<typeof formSchema>>;
  update: (data: Partial<z.infer<typeof formSchema>>) => void;
  next: () => void;
  prev: () => void;
}

const Step5 = ({ data, update, next, prev }: Step5Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    update(values);
    next();
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center gap-4">
          <Droplets className="w-12 h-12 text-primary" />
          <Bed className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="mt-4">Tus Hábitos</CardTitle>
        <CardDescription>El descanso y la hidratación son clave.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="water_intake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuántos litros de agua bebes al día?</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" placeholder="2.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sleep_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuántas horas duermes por noche?</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" placeholder="8" {...field} />
                  </FormControl>
                  <FormMessage />
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

export default Step5;