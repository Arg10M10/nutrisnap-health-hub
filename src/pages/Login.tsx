import { useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

// Tema personalizado para que Supabase Auth UI coincida con el diseño claro
const customTheme = {
  ...ThemeSupa,
  default: {
    ...ThemeSupa.default,
    colors: {
      ...ThemeSupa.default.colors,
      brand: "hsl(150 70% 45%)",
      brandAccent: "hsl(150 70% 55%)",
      brandButtonText: "white",
    },
    radii: {
      borderRadiusButton: "1.5rem",
      buttonBorderRadius: "1.5rem",
      inputBorderRadius: "1.5rem",
    },
  },
};

const Login = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        // Partículas oscuras para fondo claro
        ctx.fillStyle = `rgba(0,0,0,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="fixed inset-0 bg-gray-50 text-gray-900">
      <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        /* Líneas para tema claro */
        .hline,.vline{position:absolute;background:#e5e7eb;will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        /* Brillo oscuro para fondo claro */
        .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(0,0,0,.08),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
        .hline:nth-child(1)::after{animation-delay:.12s}
        .hline:nth-child(2)::after{animation-delay:.22s}
        .hline:nth-child(3)::after{animation-delay:.32s}
        .vline:nth-child(4)::after{animation-delay:.42s}
        .vline:nth-child(5)::after{animation-delay:.54s}
        .vline:nth-child(6)::after{animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        @keyframes shimmer{0%{opacity:0}35%{opacity:.25}100%{opacity:0}}

        /* === Animación de la tarjeta === */
        .card-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Viñeta oscura para fondo claro */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(0,0,0,0.03),transparent_60%)]" />

      {/* Líneas de acento animadas */}
      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>

      {/* Partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-50 mix-blend-multiply pointer-events-none"
      />

      {/* Encabezado */}
      <header className="absolute left-0 right-0 top-0 flex items-center justify-center px-6 py-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold tracking-widest uppercase text-gray-700">
            NutriSnap
          </span>
        </div>
      </header>

      {/* Tarjeta de inicio de sesión centrada */}
      <div className="h-full w-full grid place-items-center px-4">
        <Card className="card-animate w-full max-w-sm border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
            <CardDescription className="text-gray-500">
              Inicia sesión en tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 pt-4">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: customTheme }}
              providers={["google"]}
              theme="light"
              localization={{
                variables: {
                  sign_in: {
                    email_label: "Correo electrónico",
                    password_label: "Contraseña",
                    button_label: "Continuar",
                    social_provider_text: "Continuar con {{provider}}",
                    link_text: "¿Ya tienes una cuenta? Inicia sesión",
                  },
                  sign_up: {
                    email_label: "Correo electrónico",
                    password_label: "Contraseña",
                    button_label: "Crear cuenta",
                    link_text: "¿No tienes una cuenta? Regístrate",
                  },
                  forgotten_password: {
                    email_label: "Correo electrónico",
                    button_label: "Enviar instrucciones",
                    link_text: "¿Olvidaste tu contraseña?",
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Login;