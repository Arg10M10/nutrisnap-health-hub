import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

const formSchema = z.object({
  activity_level: z.enum(["sedentary", "light", "moderate", "active"], { required_error: "Por favor, selecciona tu nivel de actividad." }),
  exercise_days_per_week: z.string().min(1, "Selecciona los días de ejercicio."),
});

interface Step3Props {
  data: Partial<z.infer<typeof formSchema>>;
  update: (data: Partial<z.infer<typeof formSchema>>) => void;
  next: () => void;
  prev: () => void;
}

const Step3 = ({ data, update, next, prev }: Step3Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    update({ ...values, exercise_days_per_week: Number(values.exercise_days_per_week) });
    next();
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <Dumbbell className="mx-auto w-12 h-12 text-primary mb-4" />
        <CardTitle>Tu Nivel de Actividad</CardTitle>
        <CardDescription>Esto nos ayuda a calcular tus necesidades calóricas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="activity_level"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Nivel de actividad diaria</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                      <FormItem>
                        <FormControl><RadioGroupItem value="sedentary" className="sr-only" /></FormControl>
                        <FormLabel className="flex justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"><span>Poco o nada activo</span></FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl><RadioGroupItem value="light" className="sr-only" /></FormControl>
                        <FormLabel className="flex justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"><span>Ligeramente activo</span></FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl><RadioGroupItem value="moderate" className="sr-only" /></FormControl>
                        <FormLabel className="flex justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"><span>Moderadamente activo</span></FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl><RadioGroupItem value="active" className="sr-only" /></FormControl>
                        <FormLabel className="flex justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"><span>Muy activo</span></FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exercise_days_per_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de ejercicio por semana</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value || "")}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(8).keys()].map(day => <SelectItem key={day} value={String(day)}>{day} días</SelectItem>)}
                    </SelectContent>
                  </Select>
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

export default Step3;