import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf } from "lucide-react";

const formSchema = z.object({
  dietary_preferences: z.string().optional(),
  allergies: z.string().optional(),
});

interface Step4Props {
  data: Partial<z.infer<typeof formSchema>>;
  update: (data: Partial<z.infer<typeof formSchema>>) => void;
  next: () => void;
  prev: () => void;
}

const Step4 = ({ data, update, next, prev }: Step4Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const allergiesArray = values.allergies?.split(',').map(item => item.trim()).filter(Boolean) || [];
    update({ ...values, allergies: allergiesArray });
    next();
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <Leaf className="mx-auto w-12 h-12 text-primary mb-4" />
        <CardTitle>Tu Alimentación</CardTitle>
        <CardDescription>Personaliza tu plan de comidas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietary_preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferencias alimenticias</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Ninguna en particular" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Ninguna</SelectItem>
                      <SelectItem value="vegetarian">Vegetariana</SelectItem>
                      <SelectItem value="vegan">Vegana</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="paleo">Paleo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias o intolerancias</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: maní, lactosa, gluten" {...field} />
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

export default Step4;