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
    name: "Mediterranean",
    description: "Rich in fruits, vegetables, fish, and olive oil.",
    benefits: ["Cardiovascular health", "Weight management", "Longevity"],
    icon: "🥗",
    category: "General Wellness",
    foodsToEat: ["Fruits", "Vegetables", "Fish", "Olive Oil", "Nuts", "Legumes", "Whole grains"],
    foodsToAvoid: ["Processed red meats", "Added sugars", "Trans fats", "Highly processed foods"],
    sampleMealPlan: {
      breakfast: "Greek yogurt with nuts and honey.",
      lunch: "Quinoa salad with grilled salmon.",
      snack: "A handful of almonds and an apple.",
      dinner: "Baked chicken with roasted vegetables.",
    },
  },
  {
    id: 2,
    name: "Vegetarian",
    description: "Plant-based, excluding meat and fish.",
    benefits: ["Healthy digestion", "Lower cholesterol", "Sustainable"],
    icon: "🥬",
    category: "Lifestyle",
    foodsToEat: ["Fruits", "Vegetables", "Legumes", "Tofu", "Tempeh", "Eggs", "Dairy", "Seeds"],
    foodsToAvoid: ["Beef", "Chicken", "Fish", "Seafood"],
    sampleMealPlan: {
      breakfast: "Oatmeal with banana and chia seeds.",
      lunch: "Lentil soup with whole wheat bread.",
      snack: "Hummus with carrot sticks.",
      dinner: "Stir-fried tofu with broccoli and brown rice.",
    },
  },
  {
    id: 3,
    name: "Low Sodium",
    description: "Reduces salt intake for heart health.",
    benefits: ["Blood pressure", "Kidney health", "Less retention"],
    icon: "🧂",
    category: "Specific Health",
    foodsToEat: ["Fresh fruits and vegetables", "Unprocessed meats", "Herbs and spices", "Oats", "Plain yogurt"],
    foodsToAvoid: ["Canned food", "Cold cuts", "Commercial sauces", "Salty snacks", "Fast food"],
    sampleMealPlan: {
      breakfast: "Scrambled eggs with spinach and tomato.",
      lunch: "Grilled chicken breast with salad.",
      snack: "Plain yogurt with blueberries.",
      dinner: "Steamed fish with asparagus.",
    },
  },
  {
    id: 4,
    name: "High Fiber",
    description: "Promotes digestion with whole grains and vegetables.",
    benefits: ["Digestion", "Glucose control", "Satiety"],
    icon: "🌾",
    category: "General Wellness",
    foodsToEat: ["Oats", "Lentils", "Broccoli", "Apples", "Almonds", "Chia", "Whole wheat bread"],
    foodsToAvoid: ["White bread", "White rice", "Sugary drinks", "Fried food"],
    sampleMealPlan: {
      breakfast: "Bowl of oatmeal with berries and flax seeds.",
      lunch: "Black bean and vegetable chili.",
      snack: "Pear with a handful of walnuts.",
      dinner: "Salmon with quinoa and steamed broccoli.",
    },
  },
  {
    id: 5,
    name: "Anti-inflammatory",
    description: "Foods that combat chronic inflammation.",
    benefits: ["Joints", "Immune system", "Energy"],
    icon: "🍓",
    category: "Specific Health",
    foodsToEat: ["Berries", "Fatty fish (salmon)", "Broccoli", "Avocados", "Green tea", "Turmeric"],
    foodsToAvoid: ["Refined sugars", "Processed carbohydrates", "Fried foods", "Margarine"],
    sampleMealPlan: {
      breakfast: "Spinach, avocado, and berry smoothie.",
      lunch: "Large salad with grilled salmon.",
      snack: "Green tea and a handful of cherries.",
      dinner: "Chickpea curry with turmeric and vegetables.",
    },
  },
  {
    id: 6,
    name: "DASH",
    description: "Dietary Approaches to Stop Hypertension.",
    benefits: ["Blood pressure", "Cholesterol", "Heart health"],
    icon: "🩺",
    category: "Specific Health",
    foodsToEat: ["Fruits", "Vegetables", "Whole grains", "Low-fat dairy", "Chicken", "Fish"],
    foodsToAvoid: ["Sweets", "Sugary drinks", "Red meats", "Foods high in saturated fats"],
    sampleMealPlan: {
      breakfast: "Oatmeal with fruits and a glass of skim milk.",
      lunch: "Turkey sandwich on whole wheat bread with a side salad.",
      snack: "Low-fat yogurt.",
      dinner: "Baked cod with brown rice and green beans.",
    },
  },
  {
    id: 7,
    name: "Ketogenic (Keto)",
    description: "High in fats, very low in carbohydrates.",
    benefits: ["Weight loss", "Stable energy", "Sugar control"],
    icon: "🥑",
    category: "Weight Loss",
    foodsToEat: ["Avocados", "Coconut oil", "Fatty fish", "Meat", "Eggs", "Cheeses", "Green leafy vegetables"],
    foodsToAvoid: ["Grains (wheat, rice)", "Sugar", "Fruits (except berries)", "Tubers (potatoes)"],
    sampleMealPlan: {
      breakfast: "Scrambled eggs with avocado and cheese.",
      lunch: "Chicken salad with olive oil.",
      snack: "A handful of macadamia nuts.",
      dinner: "Beef steak with creamed spinach.",
    },
  },
  {
    id: 8,
    name: "Paleo",
    description: "Based on foods from the Paleolithic era.",
    benefits: ["Less processed", "Anti-inflammatory", "Satiety"],
    icon: "🍖",
    category: "Lifestyle",
    foodsToEat: ["Lean meat", "Fish", "Fruits", "Vegetables", "Nuts", "Seeds"],
    foodsToAvoid: ["Dairy", "Grains", "Legumes", "Refined sugar", "Processed foods"],
    sampleMealPlan: {
      breakfast: "Vegetable omelette with a side of fruit.",
      lunch: "Roast beef and avocado salad.",
      snack: "Celery sticks with almond butter.",
      dinner: "Grilled pork with roasted sweet potato.",
    },
  },
  {
    id: 9,
    name: "Vegan",
    description: "Excludes all animal products.",
    benefits: ["Animal ethics", "Sustainability", "Low in fat"],
    icon: "🌱",
    category: "Lifestyle",
    foodsToEat: ["Fruits", "Vegetables", "Legumes", "Grains", "Nuts", "Seeds", "Tofu", "Plant-based milks"],
    foodsToAvoid: ["Meat", "Fish", "Dairy", "Eggs", "Honey", "Gelatin"],
    sampleMealPlan: {
      breakfast: "Avocado toast with nutritional yeast.",
      lunch: "Burrito bowl with rice, black beans, and corn.",
      snack: "Almond milk and fruit smoothie.",
      dinner: "Lentil and vegetable lasagna.",
    },
  },
  {
    id: 10,
    name: "Low Carb",
    description: "Reduces carbohydrates to manage weight and sugar.",
    benefits: ["Weight control", "Stable glucose", "Fewer cravings"],
    icon: "🍞",
    category: "Weight Loss",
    foodsToEat: ["Meat", "Fish", "Eggs", "Above-ground vegetables", "Natural fats (butter, olive oil)"],
    foodsToAvoid: ["Sugar", "Starches (bread, pasta, rice, potatoes)", "Very sweet fruits"],
    sampleMealPlan: {
      breakfast: "Fried eggs with bacon.",
      lunch: "Caesar salad with grilled chicken (no croutons).",
      snack: "Cheese portions and olives.",
      dinner: "Baked salmon with broccoli.",
    },
  },
  {
    id: 11,
    name: "Gluten-Free",
    description: "For people with gluten sensitivity or celiac disease.",
    benefits: ["Improved digestion", "Less inflammation", "More energy"],
    icon: "🚫",
    category: "Specific Health",
    foodsToEat: ["Fruits", "Vegetables", "Meat", "Fish", "Rice", "Quinoa", "Corn", "Legumes"],
    foodsToAvoid: ["Wheat", "Barley", "Rye", "Oats (unless certified)", "Sauces with flour"],
    sampleMealPlan: {
      breakfast: "Yogurt with fruits and seeds.",
      lunch: "Grilled chicken with quinoa and salad.",
      snack: "Rice cakes with avocado.",
      dinner: "Vegetable and lentil soup.",
    },
  },
  {
    id: 12,
    name: "Flexitarian",
    description: "Mainly vegetarian with occasional meat consumption.",
    benefits: ["Flexible", "Healthy", "Sustainable"],
    icon: "🥕",
    category: "Lifestyle",
    foodsToEat: ["Mainly vegetables", "Fruits", "Legumes", "Grains", "Small portions of meat/fish"],
    foodsToAvoid: ["Large amounts of red meat", "Highly processed foods"],
    sampleMealPlan: {
      breakfast: "Whole wheat toast with avocado and tomato.",
      lunch: "Chickpea salad with lots of vegetables.",
      snack: "Apple and a handful of cashews.",
      dinner: "Small portion of fish with roasted sweet potato.",
    },
  },
];