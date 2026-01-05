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
  sugars: number;
  fiber: number;
  ingredients: Ingredient[];
  category: 'lunch_dinner' | 'snack_breakfast' | 'breakfast';
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
    sugars: 8,
    fiber: 6,
    category: "lunch_dinner",
    ingredients: [
      { key: "spaghetti", amount: 100, unit: "g" },
      { key: "ground_beef", amount: 120, unit: "g" },
      { key: "tomato_sauce", amount: 150, unit: "g" },
      { key: "onion", amount: 50, unit: "g" },
      { key: "garlic", amount: 5, unit: "g" },
      { key: "olive_oil", amount: 10, unit: "g" },
      { key: "salt", amount: 0, unit: "" },
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
    sugars: 5,
    fiber: 4,
    category: "lunch_dinner",
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
  {
    id: "grilled_chicken_tacos",
    image: "/recipes/grilled-chicken-tacos.png",
    time: 20,
    calories: 410,
    protein: 34,
    carbs: 38,
    fats: 14,
    sugars: 4,
    fiber: 5,
    category: "lunch_dinner",
    ingredients: [
      { key: "chicken_breast", amount: 120, unit: "g" },
      { key: "corn_tortillas", amount: 2, unit: "" },
      { key: "lettuce", amount: 40, unit: "g" },
      { key: "tomato", amount: 50, unit: "g" },
      { key: "olive_oil", amount: 5, unit: "g" },
      { key: "salt", amount: 0, unit: "" },
      { key: "pepper", amount: 0, unit: "" },
    ],
  },
  {
    id: "chicken_curry",
    image: "/recipes/chicken-curry.jpg",
    time: 30,
    calories: 520,
    protein: 36,
    carbs: 60,
    fats: 18,
    sugars: 5,
    fiber: 4,
    category: "lunch_dinner",
    ingredients: [
      { key: "chicken_breast", amount: 150, unit: "g" },
      { key: "white_rice", amount: 70, unit: "g" },
      { key: "coconut_milk_light", amount: 100, unit: "ml" },
      { key: "onion", amount: 50, unit: "g" },
      { key: "garlic", amount: 5, unit: "g" },
      { key: "olive_oil", amount: 10, unit: "g" },
      { key: "curry_powder", amount: 5, unit: "g" },
      { key: "salt", amount: 0, unit: "" },
      { key: "pepper", amount: 0, unit: "" },
    ],
  },
  {
    id: "tuna_quinoa_salad",
    image: "/recipes/tuna-quinoa-salad.png",
    time: 20,
    calories: 430,
    protein: 32,
    carbs: 42,
    fats: 15,
    sugars: 4,
    fiber: 6,
    category: "lunch_dinner",
    ingredients: [
      { key: "tuna_water", amount: 120, unit: "g" },
      { key: "cooked_quinoa", amount: 70, unit: "g" },
      { key: "tomato", amount: 80, unit: "g" },
      { key: "cucumber", amount: 60, unit: "g" },
      { key: "olive_oil", amount: 10, unit: "g" },
      { key: "lemon_juice", amount: 10, unit: "ml" },
      { key: "salt", amount: 0, unit: "" },
      { key: "pepper", amount: 0, unit: "" },
    ],
  },
  {
    id: "blueberry_almond_smoothie",
    image: "/recipes/blueberry-almond-smoothie.webp",
    time: 5,
    calories: 310,
    protein: 13,
    carbs: 32,
    fats: 15,
    sugars: 22,
    fiber: 6,
    category: "snack_breakfast",
    ingredients: [
      { key: "blueberries", amount: 120, unit: "g" },
      { key: "almond_milk", amount: 250, unit: "ml" },
      { key: "almonds", amount: 15, unit: "g" },
      { key: "yogurt", amount: 100, unit: "g" },
      { key: "honey", amount: 10, unit: "g" },
    ],
  },
  {
    id: "oats_banana_peanut",
    image: "/recipes/oat-banana-peanut.png",
    time: 10,
    calories: 520,
    protein: 18,
    carbs: 65,
    fats: 20,
    sugars: 18,
    fiber: 9,
    category: "breakfast",
    ingredients: [
      { key: "oats", amount: 60, unit: "g" },
      { key: "milk", amount: 250, unit: "ml" },
      { key: "banana", amount: 100, unit: "g" },
      { key: "peanut_butter", amount: 15, unit: "g" },
      { key: "cinnamon", amount: 0, unit: "" },
    ],
  },
];