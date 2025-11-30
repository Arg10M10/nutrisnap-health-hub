export type Diet = {
  id: number;
  name: string;
  description: string;
  benefits: string[];
  icon: string;
  category: string;
};

export const diets: Diet[] = [
  {
    id: 1,
    name: "Mediterránea",
    description: "Rica en frutas, verduras, pescado y aceite de oliva.",
    benefits: ["Salud cardiovascular", "Control de peso", "Longevidad"],
    icon: "🥗",
    category: "Bienestar General",
  },
  {
    id: 2,
    name: "Vegetariana",
    description: "Basada en plantas, excluyendo carne y pescado.",
    benefits: ["Digestión saludable", "Menor colesterol", "Sostenible"],
    icon: "🥬",
    category: "Estilo de Vida",
  },
  {
    id: 3,
    name: "Baja en Sodio",
    description: "Reduce la ingesta de sal para la salud del corazón.",
    benefits: ["Presión arterial", "Salud renal", "Menos retención"],
    icon: "🧂",
    category: "Salud Específica",
  },
  {
    id: 4,
    name: "Rica en Fibra",
    description: "Fomenta la digestión con cereales integrales y vegetales.",
    benefits: ["Digestión", "Control glucosa", "Saciedad"],
    icon: "🌾",
    category: "Bienestar General",
  },
  {
    id: 5,
    name: "Antiinflamatoria",
    description: "Alimentos que combaten la inflamación crónica.",
    benefits: ["Articulaciones", "Sistema inmune", "Energía"],
    icon: "🍓",
    category: "Salud Específica",
  },
  {
    id: 6,
    name: "DASH",
    description: "Enfoques dietéticos para detener la hipertensión.",
    benefits: ["Presión arterial", "Colesterol", "Salud cardíaca"],
    icon: "🩺",
    category: "Salud Específica",
  },
  {
    id: 7,
    name: "Cetogénica (Keto)",
    description: "Alta en grasas, muy baja en carbohidratos.",
    benefits: ["Pérdida de peso", "Energía estable", "Control de azúcar"],
    icon: "🥑",
    category: "Pérdida de Peso",
  },
  {
    id: 8,
    name: "Paleo",
    description: "Basada en alimentos de la era paleolítica.",
    benefits: ["Menos procesados", "Antiinflamatoria", "Saciedad"],
    icon: "🍖",
    category: "Estilo de Vida",
  },
  {
    id: 9,
    name: "Vegana",
    description: "Excluye todos los productos de origen animal.",
    benefits: ["Ética animal", "Sostenibilidad", "Baja en grasas"],
    icon: "🌱",
    category: "Estilo de Vida",
  },
  {
    id: 10,
    name: "Baja en Carbohidratos",
    description: "Reduce carbohidratos para controlar peso y azúcar.",
    benefits: ["Control de peso", "Glucosa estable", "Menos antojos"],
    icon: "🍞",
    category: "Pérdida de Peso",
  },
  {
    id: 11,
    name: "Sin Gluten",
    description: "Para personas con sensibilidad al gluten o celiaquía.",
    benefits: ["Mejora digestiva", "Menos inflamación", "Más energía"],
    icon: "🚫",
    category: "Salud Específica",
  },
  {
    id: 12,
    name: "Flexitariana",
    description: "Principalmente vegetariana con consumo ocasional de carne.",
    benefits: ["Flexible", "Saludable", "Sostenible"],
    icon: "🥕",
    category: "Estilo de Vida",
  },
];