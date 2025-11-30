import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target } from "lucide-react";

const formSchema = z.object({
  main_goal: z.enum(["lose", "maintain", "gain"], { required_error: "Por favor, selecciona tu objetivo principal." }),
  target_weight: z.coerce.number().min(30, "El peso debe ser de al menos 30 kg.").max(300, "El peso no puede ser mayor a 300 kg."),
});

interface Step2Props {
  data: Partial<z.infer<typeof formSchema>>;
  update: (data: Partial<z.infer<typeof formSchema>>) => void;
  next: () => void;
  prev: () => void;
}

const Step2 = ({ data, update, next, prev }: Step2Props) => {
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
        <Target className="mx-auto w-12 h-12 text-primary mb-4" />
        <CardTitle>¿Cuál es tu objetivo?</CardTitle>
        <CardDescription>Ayúdanos a entender qué quieres lograr.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="main_goal"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Objetivo principal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {["lose", "maintain", "gain"].map((goal) => (
                        <motion.div key={goal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <FormLabel className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                            <FormControl>
                              <RadioGroupItem value={goal} className="sr-only" />
                            </FormControl>
                            {goal === "lose" && "Bajar"}
                            {goal === "maintain" && "Mantenerme"}
                            {goal === "gain" && "Subir"}
                          </FormLabel>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso meta (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="65" {...field} />
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

export default Step2;