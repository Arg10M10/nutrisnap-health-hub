export type Diet = {
  id: number;
  name: string;
  description: string;
  benefits: string[];
  icon: string;
  category: string;
  foodsToEat: string[];
  foodsToAvoid: string[];
  sampleMealPlan: {
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
  };
};

export const diets: Diet[] = [
  {
    id: 1,
    name: "Mediterránea",
    description: "Rica en frutas, verduras, pescado y aceite de oliva.",
    benefits: ["Salud cardiovascular", "Control de peso", "Longevidad"],
    icon: "🥗",
    category: "Bienestar General",
    foodsToEat: ["Frutas", "Verduras", "Pescado", "Aceite de Oliva", "Nueces", "Legumbres", "Granos integrales"],
    foodsToAvoid: ["Carnes rojas procesadas", "Azúcares añadidos", "Grasas trans", "Alimentos muy procesados"],
    sampleMealPlan: {
      breakfast: "Yogur griego con nueces y miel.",
      lunch: "Ensalada de quinoa con salmón a la plancha.",
      snack: "Un puñado de almendras y una manzana.",
      dinner: "Pollo al horno con verduras asadas.",
    },
  },
  {
    id: 2,
    name: "Vegetariana",
    description: "Basada en plantas, excluyendo carne y pescado.",
    benefits: ["Digestión saludable", "Menor colesterol", "Sostenible"],
    icon: "🥬",
    category: "Estilo de Vida",
    foodsToEat: ["Frutas", "Verduras", "Legumbres", "Tofu", "Tempeh", "Huevos", "Lácteos", "Semillas"],
    foodsToAvoid: ["Carne de res", "Pollo", "Pescado", "Mariscos"],
    sampleMealPlan: {
      breakfast: "Avena con plátano y semillas de chía.",
      lunch: "Sopa de lentejas con pan integral.",
      snack: "Hummus con palitos de zanahoria.",
      dinner: "Tofu salteado con brócoli y arroz integral.",
    },
  },
  {
    id: 3,
    name: "Baja en Sodio",
    description: "Reduce la ingesta de sal para la salud del corazón.",
    benefits: ["Presión arterial", "Salud renal", "Menos retención"],
    icon: "🧂",
    category: "Salud Específica",
    foodsToEat: ["Frutas y verduras frescas", "Carnes sin procesar", "Hierbas y especias", "Avena", "Yogur natural"],
    foodsToAvoid: ["Comida enlatada", "Embutidos", "Salsas comerciales", "Snacks salados", "Comida rápida"],
    sampleMealPlan: {
      breakfast: "Huevos revueltos con espinacas y tomate.",
      lunch: "Pechuga de pollo a la plancha con ensalada.",
      snack: "Yogur natural con arándanos.",
      dinner: "Pescado al vapor con espárragos.",
    },
  },
  {
    id: 4,
    name: "Rica en Fibra",
    description: "Fomenta la digestión con cereales integrales y vegetales.",
    benefits: ["Digestión", "Control glucosa", "Saciedad"],
    icon: "🌾",
    category: "Bienestar General",
    foodsToEat: ["Avena", "Lentejas", "Brócoli", "Manzanas", "Almendras", "Chía", "Pan integral"],
    foodsToAvoid: ["Pan blanco", "Arroz blanco", "Bebidas azucaradas", "Comida frita"],
    sampleMealPlan: {
      breakfast: "Tazón de avena con bayas y semillas de lino.",
      lunch: "Chili de frijoles negros y verduras.",
      snack: "Pera con un puñado de nueces.",
      dinner: "Salmón con quinoa y brócoli al vapor.",
    },
  },
  {
    id: 5,
    name: "Antiinflamatoria",
    description: "Alimentos que combaten la inflamación crónica.",
    benefits: ["Articulaciones", "Sistema inmune", "Energía"],
    icon: "🍓",
    category: "Salud Específica",
    foodsToEat: ["Bayas", "Pescado graso (salmón)", "Brócoli", "Aguacates", "Té verde", "Cúrcuma"],
    foodsToAvoid: ["Azúcares refinados", "Carbohidratos procesados", "Frituras", "Margarina"],
    sampleMealPlan: {
      breakfast: "Batido de espinacas, aguacate y bayas.",
      lunch: "Ensalada grande con salmón a la parrilla.",
      snack: "Té verde y un puñado de cerezas.",
      dinner: "Curry de garbanzos con cúrcuma y verduras.",
    },
  },
  {
    id: 6,
    name: "DASH",
    description: "Enfoques dietéticos para detener la hipertensión.",
    benefits: ["Presión arterial", "Colesterol", "Salud cardíaca"],
    icon: "🩺",
    category: "Salud Específica",
    foodsToEat: ["Frutas", "Verduras", "Granos integrales", "Lácteos bajos en grasa", "Pollo", "Pescado"],
    foodsToAvoid: ["Dulces", "Bebidas azucaradas", "Carnes rojas", "Alimentos altos en grasas saturadas"],
    sampleMealPlan: {
      breakfast: "Avena con frutas y un vaso de leche desnatada.",
      lunch: "Sándwich de pavo en pan integral con ensalada.",
      snack: "Yogur bajo en grasa.",
      dinner: "Bacalao al horno con arroz integral y judías verdes.",
    },
  },
  {
    id: 7,
    name: "Cetogénica (Keto)",
    description: "Alta en grasas, muy baja en carbohidratos.",
    benefits: ["Pérdida de peso", "Energía estable", "Control de azúcar"],
    icon: "🥑",
    category: "Pérdida de Peso",
    foodsToEat: ["Aguacates", "Aceite de coco", "Pescado graso", "Carne", "Huevos", "Quesos", "Verduras de hoja verde"],
    foodsToAvoid: ["Granos (trigo, arroz)", "Azúcar", "Frutas (excepto bayas)", "Tubérculos (patatas)"],
    sampleMealPlan: {
      breakfast: "Huevos revueltos con aguacate y queso.",
      lunch: "Ensalada de pollo con aceite de oliva.",
      snack: "Un puñado de nueces de macadamia.",
      dinner: "Filete de ternera con espinacas a la crema.",
    },
  },
  {
    id: 8,
    name: "Paleo",
    description: "Basada en alimentos de la era paleolítica.",
    benefits: ["Menos procesados", "Antiinflamatoria", "Saciedad"],
    icon: "🍖",
    category: "Estilo de Vida",
    foodsToEat: ["Carne magra", "Pescado", "Frutas", "Verduras", "Nueces", "Semillas"],
    foodsToAvoid: ["Lácteos", "Granos", "Legumbres", "Azúcar refinada", "Alimentos procesados"],
    sampleMealPlan: {
      breakfast: "Tortilla de verduras con un lado de fruta.",
      lunch: "Ensalada de carne asada y aguacate.",
      snack: "Palitos de apio con mantequilla de almendras.",
      dinner: "Cerdo a la plancha con batata asada.",
    },
  },
  {
    id: 9,
    name: "Vegana",
    description: "Excluye todos los productos de origen animal.",
    benefits: ["Ética animal", "Sostenibilidad", "Baja en grasas"],
    icon: "🌱",
    category: "Estilo de Vida",
    foodsToEat: ["Frutas", "Verduras", "Legumbres", "Granos", "Nueces", "Semillas", "Tofu", "Leches vegetales"],
    foodsToAvoid: ["Carne", "Pescado", "Lácteos", "Huevos", "Miel", "Gelatina"],
    sampleMealPlan: {
      breakfast: "Tostada de aguacate con levadura nutricional.",
      lunch: "Burrito bowl con arroz, frijoles negros y maíz.",
      snack: "Batido de leche de almendras y frutas.",
      dinner: "Lasaña de lentejas y verduras.",
    },
  },
  {
    id: 10,
    name: "Baja en Carbohidratos",
    description: "Reduce carbohidratos para controlar peso y azúcar.",
    benefits: ["Control de peso", "Glucosa estable", "Menos antojos"],
    icon: "🍞",
    category: "Pérdida de Peso",
    foodsToEat: ["Carne", "Pescado", "Huevos", "Verduras de superficie", "Grasas naturales (mantequilla, aceite de oliva)"],
    foodsToAvoid: ["Azúcar", "Almidones (pan, pasta, arroz, patatas)", "Frutas muy dulces"],
    sampleMealPlan: {
      breakfast: "Huevos fritos con bacon.",
      lunch: "Ensalada César con pollo a la parrilla (sin picatostes).",
      snack: "Queso en porciones y aceitunas.",
      dinner: "Salmón al horno con brócoli.",
    },
  },
  {
    id: 11,
    name: "Sin Gluten",
    description: "Para personas con sensibilidad al gluten o celiaquía.",
    benefits: ["Mejora digestiva", "Menos inflamación", "Más energía"],
    icon: "🚫",
    category: "Salud Específica",
    foodsToEat: ["Frutas", "Verduras", "Carne", "Pescado", "Arroz", "Quinoa", "Maíz", "Legumbres"],
    foodsToAvoid: ["Trigo", "Cebada", "Centeno", "Avena (a menos que sea certificada)", "Salsas con harina"],
    sampleMealPlan: {
      breakfast: "Yogur con frutas y semillas.",
      lunch: "Pollo a la plancha con quinoa y ensalada.",
      snack: "Tortitas de arroz con aguacate.",
      dinner: "Sopa de verduras y lentejas.",
    },
  },
  {
    id: 12,
    name: "Flexitariana",
    description: "Principalmente vegetariana con consumo ocasional de carne.",
    benefits: ["Flexible", "Saludable", "Sostenible"],
    icon: "🥕",
    category: "Estilo de Vida",
    foodsToEat: ["Principalmente vegetales", "Frutas", "Legumbres", "Granos", "Pequeñas porciones de carne/pescado"],
    foodsToAvoid: ["Grandes cantidades de carne roja", "Alimentos muy procesados"],
    sampleMealPlan: {
      breakfast: "Tostada integral con aguacate y tomate.",
      lunch: "Ensalada de garbanzos con muchas verduras.",
      snack: "Manzana y un puñado de anacardos.",
      dinner: "Pequeña porción de pescado con batata asada.",
    },
  },
];