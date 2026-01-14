export interface Ingredient {
  key: string; // Key for translation lookup
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  instructions: string[];
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
    name: "Spaghetti Bolognese",
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
      { key: "spaghetti", name: "Spaghetti", amount: 100, unit: "g" },
      { key: "ground_beef", name: "Ground Beef (10–15% fat)", amount: 120, unit: "g" },
      { key: "tomato_sauce", name: "Crushed tomatoes or natural tomato sauce", amount: 150, unit: "g" },
      { key: "onion", name: "Onion", amount: 50, unit: "g" },
      { key: "garlic", name: "Clove of garlic", amount: 5, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
      { key: "herbs", name: "Oregano or basil", amount: 0, unit: "" },
    ],
    instructions: [
      "Boil salted water and cook spaghetti according to package instructions (8–10 minutes). Drain.",
      "Heat oil in a pan and sauté chopped onion and garlic for 2–3 minutes.",
      "Add ground beef and cook until browned.",
      "Add crushed tomatoes, salt, pepper, and herbs. Simmer for 10–15 minutes.",
      "Mix pasta with sauce or serve sauce over spaghetti."
    ]
  },
  {
    id: "grilled_chicken_rice",
    name: "Grilled Chicken with Rice and Salad",
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
      { key: "chicken_breast", name: "Chicken breast", amount: 180, unit: "g" },
      { key: "white_rice", name: "Uncooked white rice", amount: 70, unit: "g" },
      { key: "lettuce", name: "Lettuce", amount: 60, unit: "g" },
      { key: "tomato", name: "Tomato", amount: 80, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "lemon_juice", name: "Lemon juice", amount: 10, unit: "ml" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Cook the rice in salted water for 15–18 minutes. Drain.",
      "Season the chicken breast with salt and pepper.",
      "Heat a pan or griddle with 5 g of oil and cook the chicken for 5–6 minutes per side until well cooked.",
      "Chop the lettuce and tomato, mix and dress with lemon juice and the remaining 5 g of oil.",
      "Serve the chicken alongside the rice and salad."
    ]
  },
  {
    id: "grilled_chicken_tacos",
    name: "Grilled Chicken Tacos",
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
      { key: "chicken_breast", name: "Chicken breast", amount: 120, unit: "g" },
      { key: "corn_tortillas", name: "Corn tortillas", amount: 2, unit: "" },
      { key: "lettuce", name: "Lettuce", amount: 40, unit: "g" },
      { key: "tomato", name: "Tomato", amount: 50, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 5, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Cook the chicken in a pan with oil, salt, and pepper for 5–6 minutes per side.",
      "Heat the tortillas.",
      "Chop tomato and lettuce.",
      "Fill the tortillas with chicken and vegetables.",
      "Serve immediately."
    ]
  },
  {
    id: "chicken_curry",
    name: "Chicken Curry with Rice",
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
      { key: "chicken_breast", name: "Chicken breast", amount: 150, unit: "g" },
      { key: "white_rice", name: "Uncooked white rice", amount: 70, unit: "g" },
      { key: "coconut_milk_light", name: "Light coconut milk", amount: 100, unit: "ml" },
      { key: "onion", name: "Onion", amount: 50, unit: "g" },
      { key: "garlic", name: "Clove of garlic", amount: 5, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "curry_powder", name: "Curry powder", amount: 5, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Cook the rice in salted water for 15–18 minutes. Drain.",
      "In a pan, heat oil and sauté onion and garlic for 2–3 minutes.",
      "Add chicken and cook until browned.",
      "Add coconut milk and curry, cook for 10 minutes more.",
      "Serve the chicken over the rice."
    ]
  },
  {
    id: "tuna_quinoa_salad",
    name: "Tuna and Quinoa Salad",
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
      { key: "tuna_water", name: "Tuna in water", amount: 120, unit: "g" },
      { key: "cooked_quinoa", name: "Cooked quinoa", amount: 70, unit: "g" },
      { key: "tomato", name: "Tomato", amount: 80, unit: "g" },
      { key: "cucumber", name: "Cucumber", amount: 60, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "lemon_juice", name: "Lemon juice", amount: 10, unit: "ml" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Cook quinoa according to package instructions and drain.",
      "Mix chopped tuna, tomato, and cucumber.",
      "Add quinoa, oil, lemon juice, salt, and pepper.",
      "Toss and serve."
    ]
  },
  {
    id: "spinach_cheese_omelette",
    name: "Spinach and Cheese Omelette",
    image: "/recipes/omelette-con-relleno-de-queso-y-espinaca.jpg",
    time: 10,
    calories: 310,
    protein: 24,
    carbs: 3,
    fats: 22,
    sugars: 2,
    fiber: 2,
    category: "breakfast",
    ingredients: [
      { key: "eggs", name: "Eggs (100g)", amount: 2, unit: "" },
      { key: "spinach", name: "Fresh spinach", amount: 50, unit: "g" },
      { key: "low_fat_cheese", name: "Low fat grated cheese", amount: 30, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 5, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Beat the eggs with salt and pepper.",
      "Heat oil in a pan and add spinach for 1–2 minutes.",
      "Add the eggs and cook for 2–3 minutes.",
      "Add cheese, fold the omelette and serve."
    ]
  },
  {
    id: "yogurt_fruits_granola",
    name: "Yogurt with Fruit and Granola",
    image: "/recipes/yogurt-fruits-granola.jpg",
    time: 5,
    calories: 320,
    protein: 12,
    carbs: 55,
    fats: 8,
    sugars: 25,
    fiber: 5,
    category: "breakfast",
    ingredients: [
      { key: "yogurt", name: "Non-fat plain yogurt", amount: 150, unit: "g" },
      { key: "strawberries", name: "Strawberries", amount: 60, unit: "g" },
      { key: "banana", name: "Banana", amount: 50, unit: "g" },
      { key: "granola", name: "Granola", amount: 30, unit: "g" },
      { key: "honey", name: "Honey (optional)", amount: 5, unit: "g" },
    ],
    instructions: [
      "Cut the fruit into small pieces.",
      "Mix the yogurt with the fruit.",
      "Sprinkle the granola on top.",
      "Add honey if desired and serve."
    ]
  },
  {
    id: "blueberry_almond_smoothie",
    name: "Blueberry Almond Smoothie",
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
      { key: "blueberries", name: "Fresh blueberries", amount: 120, unit: "g" },
      { key: "almond_milk", name: "Unsweetened almond milk", amount: 250, unit: "ml" },
      { key: "almonds", name: "Raw almonds", amount: 15, unit: "g" },
      { key: "yogurt", name: "Non-fat plain yogurt", amount: 100, unit: "g" },
      { key: "honey", name: "Honey (optional)", amount: 10, unit: "g" },
    ],
    instructions: [
      "Place blueberries, almond milk, almonds, and yogurt in a blender.",
      "Blend for 30–45 seconds until smooth.",
      "Taste and add honey if more sweetness is desired. Blend for a few more seconds.",
      "Serve immediately."
    ]
  },
  {
    id: "mango_oat_smoothie",
    name: "Mango Oat Smoothie",
    image: "/recipes/licuado-mango-avena-coco.jpg",
    time: 5,
    calories: 280,
    protein: 7,
    carbs: 55,
    fats: 6,
    sugars: 28,
    fiber: 4,
    category: "snack_breakfast",
    ingredients: [
      { key: "mango", name: "Mango", amount: 150, unit: "g" },
      { key: "milk", name: "Skim or plant-based milk", amount: 200, unit: "ml" },
      { key: "oats", name: "Rolled oats", amount: 30, unit: "g" },
      { key: "honey", name: "Honey (optional)", amount: 5, unit: "g" },
    ],
    instructions: [
      "Place all ingredients in the blender.",
      "Blend for 30–45 seconds until smooth.",
      "Serve immediately."
    ]
  },
  {
    id: "oats_banana_peanut",
    name: "Oatmeal with Banana & Peanut Butter",
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
      { key: "oats", name: "Rolled oats", amount: 60, unit: "g" },
      { key: "milk", name: "Milk (or plant-based)", amount: 250, unit: "ml" },
      { key: "banana", name: "Banana", amount: 100, unit: "g" },
      { key: "peanut_butter", name: "Peanut butter", amount: 15, unit: "g" },
      { key: "cinnamon", name: "Cinnamon", amount: 0, unit: "" },
    ],
    instructions: [
      "In a small pot, mix the oats with the milk.",
      "Cook over medium heat for 5-7 minutes until thickened.",
      "Mash half the banana and add it along with cinnamon to the oats. Mix well.",
      "Serve in a bowl and top with the rest of the sliced banana and peanut butter."
    ]
  },
  {
    id: "baked_salmon_vegetables",
    name: "Baked Salmon with Vegetables",
    image: "/recipes/salmon-al-horno-con-verduras.jpg",
    time: 25,
    calories: 480,
    protein: 34,
    carbs: 18,
    fats: 30,
    sugars: 4,
    fiber: 6,
    category: "lunch_dinner",
    ingredients: [
      { key: "salmon_fillet", name: "Salmon fillet", amount: 150, unit: "g" },
      { key: "broccoli", name: "Broccoli", amount: 100, unit: "g" },
      { key: "carrot", name: "Carrot", amount: 80, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "lemon_juice", name: "Lemon juice", amount: 10, unit: "ml" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Preheat the oven to 180 °C (350 °F).",
      "Place the salmon and vegetables on a baking tray.",
      "Add olive oil, lemon juice, salt, and pepper.",
      "Bake for 20–25 minutes.",
      "Serve hot."
    ]
  },
  {
    id: "lentil_stew",
    name: "Stewed Lentils with Vegetables",
    image: "/recipes/lentejas-guisadas.jpg",
    time: 35,
    calories: 420,
    protein: 22,
    carbs: 55,
    fats: 14,
    sugars: 6,
    fiber: 15,
    category: "lunch_dinner",
    ingredients: [
      { key: "cooked_lentils", name: "Cooked lentils", amount: 150, unit: "g" },
      { key: "carrot", name: "Carrot", amount: 60, unit: "g" },
      { key: "bell_pepper", name: "Bell pepper", amount: 60, unit: "g" },
      { key: "onion", name: "Onion", amount: 50, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
      { key: "cumin", name: "Cumin", amount: 0, unit: "" },
    ],
    instructions: [
      "Sauté onion, carrot, and pepper in oil for 5 minutes.",
      "Add the lentils and spices.",
      "Cook over medium heat for 10–15 minutes.",
      "Serve hot."
    ]
  },
  {
    id: "turkey_mashed_potatoes",
    name: "Turkey Breast with Mashed Potatoes",
    image: "/recipes/turkey-breast-mashed-potatoes.jpg",
    time: 30,
    calories: 500,
    protein: 38,
    carbs: 40,
    fats: 20,
    sugars: 4,
    fiber: 5,
    category: "lunch_dinner",
    ingredients: [
      { key: "turkey_breast", name: "Turkey breast", amount: 160, unit: "g" },
      { key: "potato", name: "Potato", amount: 200, unit: "g" },
      { key: "skim_milk", name: "Skim milk", amount: 50, unit: "ml" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Boil the potato until soft and mash with milk.",
      "Grill the turkey with oil, salt, and pepper.",
      "Serve the turkey with the mashed potatoes."
    ]
  },
  {
    id: "brown_rice_eggs",
    name: "Brown Rice with Eggs and Vegetables",
    image: "/recipes/brown-rice-egg-veggies.png",
    time: 20,
    calories: 460,
    protein: 24,
    carbs: 42,
    fats: 22,
    sugars: 2,
    fiber: 6,
    category: "lunch_dinner",
    ingredients: [
      { key: "cooked_brown_rice", name: "Cooked brown rice", amount: 120, unit: "g" },
      { key: "eggs", name: "Eggs", amount: 2, unit: "" },
      { key: "spinach", name: "Spinach", amount: 50, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Sauté spinach with oil for 1-2 minutes.",
      "Add eggs and cook to taste.",
      "Serve with brown rice."
    ]
  },
  {
    id: "chicken_wrap",
    name: "Whole Wheat Chicken and Vegetable Wrap",
    image: "/recipes/chicken-vegetable-wrap.jpg",
    time: 15,
    calories: 390,
    protein: 30,
    carbs: 35,
    fats: 10,
    sugars: 5,
    fiber: 5,
    category: "lunch_dinner",
    ingredients: [
      { key: "whole_wheat_tortilla", name: "Whole wheat tortilla", amount: 1, unit: "" },
      { key: "chicken_breast", name: "Chicken breast", amount: 120, unit: "g" },
      { key: "lettuce", name: "Lettuce", amount: 40, unit: "g" },
      { key: "tomato", name: "Tomato", amount: 60, unit: "g" },
      { key: "yogurt", name: "Non-fat plain yogurt", amount: 40, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Grill chicken with salt and pepper.",
      "Mix yogurt with salt for sauce.",
      "Fill tortilla with chicken, vegetables and sauce.",
      "Roll and serve."
    ]
  },
  {
    id: "chicken_rice_bowl",
    name: "Chicken & Brown Rice Bowl",
    image: "/recipes/chicken-rice-bowl.jpg",
    time: 25,
    calories: 480,
    protein: 35,
    carbs: 45,
    fats: 15,
    sugars: 3,
    fiber: 6,
    category: "lunch_dinner",
    ingredients: [
      { key: "chicken_breast", name: "Chicken breast", amount: 150, unit: "g" },
      { key: "cooked_brown_rice", name: "Cooked brown rice", amount: 120, unit: "g" },
      { key: "broccoli", name: "Broccoli", amount: 80, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Grill the chicken breast.",
      "Sauté the broccoli with olive oil.",
      "Serve everything together with the rice."
    ]
  },
  {
    id: "fish_potato",
    name: "Fish Fillet with Boiled Potato",
    image: "/recipes/fish-potato.jpg",
    time: 30,
    calories: 460,
    protein: 32,
    carbs: 40,
    fats: 18,
    sugars: 3,
    fiber: 4,
    category: "lunch_dinner",
    ingredients: [
      { key: "white_fish", name: "White fish fillet", amount: 160, unit: "g" },
      { key: "potato", name: "Potato", amount: 200, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "lemon_juice", name: "Lemon", amount: 10, unit: "ml" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "pepper", name: "Pepper", amount: 0, unit: "" },
    ],
    instructions: [
      "Boil the potato.",
      "Cook the fish on a griddle or pan.",
      "Serve with lemon."
    ]
  },
  {
    id: "whole_wheat_pasta",
    name: "Whole Wheat Pasta with Veggies",
    image: "/recipes/whole-wheat-pasta.jpg",
    time: 25,
    calories: 430,
    protein: 14,
    carbs: 65,
    fats: 12,
    sugars: 5,
    fiber: 7,
    category: "lunch_dinner",
    ingredients: [
      { key: "raw_whole_pasta", name: "Uncooked whole wheat pasta", amount: 80, unit: "g" },
      { key: "zucchini", name: "Zucchini", amount: 80, unit: "g" },
      { key: "bell_pepper", name: "Bell pepper", amount: 60, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
      { key: "salt", name: "Salt", amount: 0, unit: "" },
      { key: "herbs", name: "Spices", amount: 0, unit: "" },
    ],
    instructions: [
      "Cook the pasta.",
      "Sauté the vegetables.",
      "Mix and serve."
    ]
  },
  {
    id: "beef_salad",
    name: "Lean Beef with Mixed Salad",
    image: "/recipes/beef-salad.jpg",
    time: 20,
    calories: 500,
    protein: 36,
    carbs: 10,
    fats: 28,
    sugars: 4,
    fiber: 4,
    category: "lunch_dinner",
    ingredients: [
      { key: "lean_beef", name: "Lean beef", amount: 150, unit: "g" },
      { key: "lettuce", name: "Lettuce", amount: 60, unit: "g" },
      { key: "tomato", name: "Tomato", amount: 80, unit: "g" },
      { key: "olive_oil", name: "Olive oil", amount: 10, unit: "g" },
    ],
    instructions: [
      "Grill the beef.",
      "Prepare the salad.",
      "Serve together."
    ]
  },
];