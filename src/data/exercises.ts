import { HeartPulse, Dumbbell, PersonStanding, Bike, BrainCircuit, Wind } from 'lucide-react';

export type Exercise = {
  name: string;
  description: string;
  category: 'Cardio' | 'Fuerza' | 'Flexibilidad' | 'Equilibrio';
  icon: React.ElementType;
  minAge: number;
  maxAge: number;
  whatItIs: string;
  howToDoIt: string[];
  duration: string;
};

export const exercises: Exercise[] = [
  // Niños (6-17)
  { 
    name: 'Juegos al aire libre', 
    description: 'Correr, saltar, jugar. 60 min al día.', 
    category: 'Cardio', 
    icon: Wind, 
    minAge: 6, 
    maxAge: 17,
    whatItIs: 'Actividad física no estructurada que fomenta el movimiento a través del juego, como la mancha, saltar la soga o simplemente correr en un parque.',
    howToDoIt: [
      'Encuentra un espacio seguro al aire libre.',
      'Invita a amigos o familiares a jugar.',
      'Combina diferentes actividades: correr, saltar, trepar.',
      'Lo más importante es divertirse y mantenerse en movimiento.'
    ],
    duration: 'Al menos 60 minutos de actividad moderada a vigorosa todos los días.'
  },
  { 
    name: 'Deportes de equipo', 
    description: 'Fútbol, baloncesto. 2-3 veces por semana.', 
    category: 'Cardio', 
    icon: HeartPulse, 
    minAge: 8, 
    maxAge: 17,
    whatItIs: 'Actividades deportivas organizadas que involucran cooperación, estrategia y ejercicio físico intenso, como fútbol, baloncesto, voleibol, etc.',
    howToDoIt: [
      'Únete a un equipo escolar o de tu comunidad.',
      'Aprende las reglas básicas del deporte elegido.',
      'Participa activamente en los entrenamientos y partidos.',
      'Fomenta el trabajo en equipo y la comunicación.'
    ],
    duration: 'Practicar al menos 2 o 3 veces por semana.'
  },

  // Adultos Jóvenes (18-30)
  { 
    name: 'Entrenamiento HIIT', 
    description: 'Intervalos de alta intensidad. 2-3 veces por semana.', 
    category: 'Cardio', 
    icon: HeartPulse, 
    minAge: 18, 
    maxAge: 30,
    whatItIs: 'El Entrenamiento Interválico de Alta Intensidad (HIIT) consiste en ráfagas cortas de ejercicio intenso seguidas de breves períodos de recuperación.',
    howToDoIt: [
      'Calienta durante 5-10 minutos.',
      'Realiza un ejercicio (sprints, burpees) a máxima intensidad por 30 segundos.',
      'Descansa por 15-20 segundos.',
      'Repite este ciclo durante 15-20 minutos.',
      'Finaliza con un enfriamiento y estiramientos.'
    ],
    duration: '2 a 3 sesiones de 20-30 minutos por semana.'
  },
  { 
    name: 'Levantamiento de pesas', 
    description: 'Para ganar fuerza y músculo. 3-4 veces por semana.', 
    category: 'Fuerza', 
    icon: Dumbbell, 
    minAge: 18, 
    maxAge: 40,
    whatItIs: 'Entrenamiento de resistencia que utiliza pesas (mancuernas, barras) para desarrollar fuerza y masa muscular.',
    howToDoIt: [
      'Aprende la técnica correcta para cada levantamiento (sentadillas, peso muerto, press de banca).',
      'Comienza con un peso que puedas manejar de forma segura.',
      'Realiza 3-4 series de 8-12 repeticiones por ejercicio.',
      'Asegúrate de descansar los grupos musculares entre sesiones.'
    ],
    duration: '3 a 4 veces por semana, enfocándose en diferentes grupos musculares cada día.'
  },

  // Adultos (31-50)
  { 
    name: 'Entrenamiento funcional', 
    description: 'Movimientos de la vida diaria. 3 veces por semana.', 
    category: 'Fuerza', 
    icon: Dumbbell, 
    minAge: 31, 
    maxAge: 50,
    whatItIs: 'Ejercicios que entrenan los músculos para trabajar juntos y prepararlos para las tareas diarias, simulando movimientos comunes que podrías hacer en casa o en el trabajo.',
    howToDoIt: [
      'Incorpora sentadillas (como al sentarse), peso muerto (como al levantar algo del suelo) y empujes.',
      'Utiliza pesas rusas, bandas de resistencia o tu propio peso corporal.',
      'Concéntrate en la forma y el control del movimiento.',
      'Combina varios ejercicios en un circuito.'
    ],
    duration: '3 sesiones de 45-60 minutos por semana.'
  },
  { 
    name: 'Natación', 
    description: 'Bajo impacto para articulaciones. 2-3 veces por semana.', 
    category: 'Cardio', 
    icon: HeartPulse, 
    minAge: 31, 
    maxAge: 80,
    whatItIs: 'Un ejercicio de cuerpo completo que se realiza en el agua, lo que reduce el impacto en las articulaciones. Excelente para la salud cardiovascular y la resistencia.',
    howToDoIt: [
      'Elige un estilo (crol, espalda, pecho) con el que te sientas cómodo.',
      'Mantén un ritmo constante que eleve tu frecuencia cardíaca.',
      'Concéntrate en la técnica de respiración.',
      'Alterna entre largos de nado y períodos cortos de descanso.'
    ],
    duration: '2 a 3 sesiones de 30-45 minutos por semana.'
  },

  // Adultos Mayores (51-65)
  { 
    name: 'Caminata rápida', 
    description: 'Mantén un buen ritmo. 30-45 min, 5 días a la semana.', 
    category: 'Cardio', 
    icon: HeartPulse, 
    minAge: 51, 
    maxAge: 80,
    whatItIs: 'Caminar a un ritmo enérgico que aumenta la frecuencia cardíaca y la respiración. Es una forma accesible y efectiva de ejercicio cardiovascular.',
    howToDoIt: [
      'Usa calzado cómodo y de apoyo.',
      'Mantén una buena postura: espalda recta, hombros hacia atrás.',
      'Balancea los brazos para ayudar a impulsar el movimiento.',
      'Camina a un ritmo en el que aún puedas mantener una conversación.'
    ],
    duration: 'Al menos 30 minutos, 5 días a la semana.'
  },
  { 
    name: 'Tai Chi', 
    description: 'Mejora equilibrio y flexibilidad. 2-3 veces por semana.', 
    category: 'Equilibrio', 
    icon: BrainCircuit, 
    minAge: 51, 
    maxAge: 80,
    whatItIs: 'Un arte marcial chino que consiste en movimientos lentos, suaves y fluidos. Se le conoce como "meditación en movimiento" y es excelente para el equilibrio y la reducción del estrés.',
    howToDoIt: [
      'Busca una clase para principiantes o sigue videos guiados.',
      'Concéntrate en la respiración profunda y los movimientos controlados.',
      'Transfiere tu peso de manera lenta y deliberada de un pie a otro.',
      'Mantén las rodillas ligeramente flexionadas.'
    ],
    duration: '2 a 3 sesiones de 45-60 minutos por semana.'
  },
];