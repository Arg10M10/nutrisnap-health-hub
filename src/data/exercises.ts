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
  { 
    name: 'Ejercicios con peso corporal', 
    description: 'Flexiones, sentadillas, planchas. 2-3 veces/sem.', 
    category: 'Fuerza', 
    icon: Dumbbell, 
    minAge: 10, 
    maxAge: 17,
    whatItIs: 'Ejercicios que usan el propio peso del cuerpo para crear resistencia y fortalecer los músculos, como flexiones, sentadillas y planchas. Son seguros y fundamentales para el desarrollo físico.',
    howToDoIt: [
      'Aprende la forma correcta para evitar lesiones.', 
      'Comienza con pocas repeticiones y aumenta gradualmente.', 
      'Concéntrate en mantener el abdomen apretado.', 
      'Puedes hacer variaciones más fáciles, como flexiones de rodillas.'
    ],
    duration: '2 a 3 veces por semana, en días no consecutivos.'
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
  { 
    name: 'Yoga o Pilates', 
    description: 'Mejora flexibilidad, fuerza y mente. 2-3 veces/sem.', 
    category: 'Flexibilidad', 
    icon: PersonStanding, 
    minAge: 18, 
    maxAge: 50,
    whatItIs: 'Disciplinas que combinan posturas físicas, técnicas de respiración y meditación o concentración. Son excelentes para mejorar la flexibilidad, la fuerza del core y reducir el estrés.',
    howToDoIt: [
      'Busca una clase para principiantes o sigue videos en línea.', 
      'Concéntrate en la conexión entre movimiento y respiración.', 
      'No fuerces las posturas, la flexibilidad mejora con el tiempo.', 
      'Usa una esterilla para mayor comodidad y agarre.'
    ],
    duration: '2 a 3 sesiones de 45-60 minutos por semana.'
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
  { 
    name: 'Ciclismo', 
    description: 'Cardio de bajo impacto, ideal para resistencia. 2-3 veces/sem.', 
    category: 'Cardio', 
    icon: Bike, 
    minAge: 31, 
    maxAge: 65,
    whatItIs: 'Ya sea en una bicicleta estática o al aire libre, el ciclismo es un excelente ejercicio cardiovascular que fortalece las piernas y mejora la resistencia sin ejercer mucha presión sobre las articulaciones.',
    howToDoIt: [
      'Ajusta la altura del asiento para que tu pierna esté casi extendida en la parte inferior del pedal.', 
      'Mantén un ritmo constante (cadencia) de 80-100 RPM.', 
      'Varía la resistencia o la inclinación para simular diferentes terrenos.', 
      'Si es al aire libre, usa siempre casco.'
    ],
    duration: '2 a 3 paseos de 30-60 minutos por semana.'
  },

  // Adultos Mayores (51-80)
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
  { 
    name: 'Ejercicios de fuerza con bandas', 
    description: 'Fortalece músculos sin impacto. 2 veces/sem.', 
    category: 'Fuerza', 
    icon: Dumbbell, 
    minAge: 51, 
    maxAge: 80,
    whatItIs: 'Uso de bandas elásticas de resistencia para fortalecer los principales grupos musculares. Es una forma segura y efectiva de mantener la masa muscular y la densidad ósea, con un riesgo mínimo de lesiones.',
    howToDoIt: [
      'Elige una banda con una resistencia adecuada para ti.', 
      'Realiza movimientos lentos y controlados.', 
      'Concéntrate en ejercicios para piernas, espalda y brazos.', 
      'Realiza 2-3 series de 10-15 repeticiones por ejercicio.'
    ],
    duration: '2 sesiones de 20-30 minutos por semana, en días no consecutivos.'
  }
];