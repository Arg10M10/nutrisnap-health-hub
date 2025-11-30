import { HeartPulse, Dumbbell, PersonStanding, Bike, BrainCircuit, Wind } from 'lucide-react';

export type Exercise = {
  name: string;
  description: string;
  category: 'Cardio' | 'Fuerza' | 'Flexibilidad' | 'Equilibrio';
  icon: React.ElementType;
  minAge: number;
  maxAge: number;
};

export const exercises: Exercise[] = [
  // Niños (6-17)
  { name: 'Juegos al aire libre', description: 'Correr, saltar, jugar. 60 min al día.', category: 'Cardio', icon: Wind, minAge: 6, maxAge: 17 },
  { name: 'Deportes de equipo', description: 'Fútbol, baloncesto. 2-3 veces por semana.', category: 'Cardio', icon: HeartPulse, minAge: 8, maxAge: 17 },
  { name: 'Gimnasia o baile', description: 'Mejora la coordinación. 2 veces por semana.', category: 'Flexibilidad', icon: PersonStanding, minAge: 6, maxAge: 17 },

  // Adultos Jóvenes (18-30)
  { name: 'Entrenamiento HIIT', description: 'Intervalos de alta intensidad. 2-3 veces por semana.', category: 'Cardio', icon: HeartPulse, minAge: 18, maxAge: 30 },
  { name: 'Levantamiento de pesas', description: 'Para ganar fuerza y músculo. 3-4 veces por semana.', category: 'Fuerza', icon: Dumbbell, minAge: 18, maxAge: 40 },
  { name: 'Yoga Dinámico', description: 'Combina fuerza y flexibilidad. 2 veces por semana.', category: 'Flexibilidad', icon: PersonStanding, minAge: 18, maxAge: 50 },
  { name: 'Correr o Ciclismo', description: 'Mejora la resistencia. 3 sesiones de 30-45 min.', category: 'Cardio', icon: Bike, minAge: 18, maxAge: 50 },

  // Adultos (31-50)
  { name: 'Entrenamiento funcional', description: 'Movimientos de la vida diaria. 3 veces por semana.', category: 'Fuerza', icon: Dumbbell, minAge: 31, maxAge: 50 },
  { name: 'Pilates', description: 'Fortalece el core y mejora postura. 2-3 veces por semana.', category: 'Flexibilidad', icon: PersonStanding, minAge: 31, maxAge: 65 },
  { name: 'Natación', description: 'Bajo impacto para articulaciones. 2-3 veces por semana.', category: 'Cardio', icon: HeartPulse, minAge: 31, maxAge: 80 },

  // Adultos Mayores (51-65)
  { name: 'Caminata rápida', description: 'Mantén un buen ritmo. 30-45 min, 5 días a la semana.', category: 'Cardio', icon: HeartPulse, minAge: 51, maxAge: 80 },
  { name: 'Ejercicios con bandas', description: 'Resistencia para mantener músculo. 2-3 veces por semana.', category: 'Fuerza', icon: Dumbbell, minAge: 51, maxAge: 80 },
  { name: 'Tai Chi', description: 'Mejora equilibrio y flexibilidad. 2-3 veces por semana.', category: 'Equilibrio', icon: BrainCircuit, minAge: 51, maxAge: 80 },

  // Mayores de 65
  { name: 'Ejercicios en silla', description: 'Fortalecimiento sentado. 3-4 veces por semana.', category: 'Fuerza', icon: Dumbbell, minAge: 65, maxAge: 80 },
  { name: 'Caminar lento', description: 'Mantente activo sin forzar. 20-30 min diarios.', category: 'Cardio', icon: HeartPulse, minAge: 65, maxAge: 80 },
  { name: 'Estiramientos suaves', description: 'Para mantener la movilidad. Diariamente.', category: 'Flexibilidad', icon: PersonStanding, minAge: 65, maxAge: 80 },
];