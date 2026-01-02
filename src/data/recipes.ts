export interface Ingredient {
  key: string; // Key for translation lookup
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  image: string;
  time: number; // minutes
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: Ingredient[];
}

export const recipes: Recipe[] = [
  {
    id: "spaghetti_bolognese",
    image: "/recipes/espagueti-salsa-bolon_esa.webp",
    time: 30,
    calories: 620,
    protein: 32,
    carbs: 75,
    fats: 22,
    ingredients: [
      { key: "spaghetti", amount: 100, unit: "g" },
      { key: "ground_beef", amount: 120, unit: "g" },
      { key: "tomato_sauce", amount: 150, unit: "g" },
      { key: "onion", amount: 50, unit: "g" },
      { key: "garlic", amount: 5, unit: "g" },
      { key: "olive_oil", amount: 10, unit: "g" },
      { key: "salt", amount: 0, unit: "" }, // 0 amount means "to taste" logic in UI
      { key: "pepper", amount: 0, unit: "" },
      { key: "herbs", amount: 0, unit: "" },
    ],
  },
  {
    id: "grilled_chicken_rice",
    image: "/recipes/grilled-chicken-rice-salad.jpg",
    time: 25,
    calories: 540,
    protein: 45,
    carbs: 55,
    fats: 15,
    ingredients: [
      { key: "chicken_breast", amount: 180, unit: "g" },
      { key: "white_rice", amount: 70, unit: "g" },
      { key: "lettuce", amount: 60, unit: "g" },
      { key: "tomato", amount: 80, unit: "g" },
      { key: "olive_oil", amount: 10, unit: "g" },
      { key: "lemon_juice", amount: 10, unit: "ml" },
      { key: "salt", amount: 0, unit: "" },
      { key: "pepper", amount: 0, unit: "" },
    ],
  },
];