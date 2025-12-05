import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, Sparkles, ShieldCheck, Rocket, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

type PlanId = "monthly" | "yearly";

const plans = [
  {
    id: "monthly" as PlanId,
    title: "Mensual",
    price: "$2",
    period: "/mes",
    highlight: "Prueba sin compromiso",
    benefits: [
      "Acceso completo a Calorel",
      "Escáner de comida con IA",
      "Registro de ejercicio y progreso",
      "Actualizaciones y nuevas funciones",
    ],
    badge: "Más flexible",
  },
  {
    id: "yearly" as PlanId,
    title: "Anual",
    price: "$24",
    period: "/año",
    highlight: "Ahorra 2 meses",
    benefits: [
      "Todo lo del plan mensual",
      "Menos de $2/mes",
      "Prioridad en nuevas funciones",
      "Soporte preferente",
    ],
    badge: "Mejor valor",
    featured: true,
  },
];

const Subscription = () => {
  const [selected, setSelected] = useState<PlanId>("yearly");
  const navigate = useNavigate();
  const { setSubscribedLocally } = useAuth();

  const handleContinue = () => {
    // Aquí en el futuro iría el checkout real
    setSubscribedLocally(true);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background-gradient-start to-background px-4 py-6">
      <header className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full bg-card/70 backdrop-blur-sm border border-border/60"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/90 text-primary-foreground shadow-lg"
            animate={{ rotate: [0, -8, 6, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
              Paso extra
            </p>
            <h1 className="text-xl font-bold text-foreground">
              Elige tu suscripción
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        <section className="space-y-3">
          <p className="text-base text-muted-foreground">
            Calorel necesita una pequeña suscripción para seguir mejorando la app
            y mantener los costes de IA. Elige el plan que mejor se adapte a ti.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>
              Esto es solo una previsualización — todavía no se realizan pagos reales.
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isSelected = selected === plan.id;
            return (
              <motion.button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className="text-left"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Card
                  className={`relative h-full overflow-hidden border-2 transition-colors ${
                    isSelected
                      ? "border-primary shadow-lg shadow-primary/20 bg-card"
                      : "border-border/70 bg-card/90 hover:border-primary/60"
                  }`}
                >
                  {plan.featured && (
                    <motion.div
                      className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Crown className="w-3 h-3" />
                      {plan.badge}
                    </motion.div>
                  )}
                  {!plan.featured && (
                    <div className="absolute right-4 top-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          {plan.title}
                          {plan.featured && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Recomendado
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plan.highlight}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-2xl font-bold text-foreground">
                            {plan.price}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {plan.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-sm">
                      {plan.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className="mt-1 flex items-center gap-2 text-xs font-medium text-primary"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                        >
                          <Rocket className="w-4 h-4" />
                          <span>Plan seleccionado</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.button>
            );
          })}
        </section>
      </main>

      <footer className="mt-6 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          onClick={handleContinue}
        >
          Continuar con plan {selected === "monthly" ? "Mensual ($2/mes)" : "Anual ($24/año)"}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center leading-snug">
          En el futuro aquí se abrirá el checkout real (Stripe u otro proveedor) para completar el pago
          antes de usar la app.
        </p>
      </footer>
    </div>
  );
};

export default Subscription;