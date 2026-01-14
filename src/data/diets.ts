export type Diet = {
  id: string;
  nameKey: string;
  shortDescKey: string;
  descriptionKey: string;
  objectiveKey: string;
  idealForKeys: string[];
  notRecommendedForKeys: string[];
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  image: string;
  icon: string;
  // Legacy fields kept optional for compatibility if needed, though likely unused now
  category?: string;
  foodsToEat?: string[];
  foodsToAvoid?: string[];
  textColor?: 'light' | 'dark';
};

export const diets: Diet[] = [
  {
    id: "high_protein",
    nameKey: "diet_types_data.high_protein.name",
    shortDescKey: "diet_types_data.high_protein.short_desc",
    descriptionKey: "diet_types_data.high_protein.description",
    objectiveKey: "diet_types_data.high_protein.objective",
    idealForKeys: [
      "diet_types_data.high_protein.ideal_for_1",
      "diet_types_data.high_protein.ideal_for_2",
      "diet_types_data.high_protein.ideal_for_3"
    ],
    notRecommendedForKeys: [
      "diet_types_data.high_protein.not_recommended_for_1",
      "diet_types_data.high_protein.not_recommended_for_2"
    ],
    macros: {
      protein: "30–40 %",
      carbs: "30–40 %",
      fats: "20–30 %"
    },
    image: "/diets/high-protein.jpg",
    icon: "💪",
    textColor: 'light'
  },
  {
    id: "keto",
    nameKey: "diet_types_data.keto.name",
    shortDescKey: "diet_types_data.keto.short_desc",
    descriptionKey: "diet_types_data.keto.description",
    objectiveKey: "diet_types_data.keto.objective",
    idealForKeys: [
      "diet_types_data.keto.ideal_for_1",
      "diet_types_data.keto.ideal_for_2"
    ],
    notRecommendedForKeys: [
      "diet_types_data.keto.not_recommended_for_1",
      "diet_types_data.keto.not_recommended_for_2"
    ],
    macros: {
      protein: "20–25 %",
      carbs: "5–10 %",
      fats: "70–75 %"
    },
    image: "/diets/keto.webp",
    icon: "🥑",
    textColor: 'light'
  },
  {
    id: "vegetarian",
    nameKey: "diet_types_data.vegetarian.name",
    shortDescKey: "diet_types_data.vegetarian.short_desc",
    descriptionKey: "diet_types_data.vegetarian.description",
    objectiveKey: "diet_types_data.vegetarian.objective",
    idealForKeys: [
      "diet_types_data.vegetarian.ideal_for_1",
      "diet_types_data.vegetarian.ideal_for_2"
    ],
    notRecommendedForKeys: [], // No specific contraindications listed
    macros: {
      protein: "20–25 %",
      carbs: "45–55 %",
      fats: "25–30 %"
    },
    image: "/diets/vegetarian.jpg",
    icon: "🥗",
    textColor: 'light'
  },
  {
    id: "mediterranean",
    nameKey: "diet_types_data.mediterranean.name",
    shortDescKey: "diet_types_data.mediterranean.short_desc",
    descriptionKey: "diet_types_data.mediterranean.description",
    objectiveKey: "diet_types_data.mediterranean.objective",
    idealForKeys: [
      "diet_types_data.mediterranean.ideal_for_1",
      "diet_types_data.mediterranean.ideal_for_2"
    ],
    notRecommendedForKeys: [], // No specific contraindications listed
    macros: {
      protein: "20–25 %",
      carbs: "35–40 %",
      fats: "35–40 %"
    },
    image: "/diets/mediterranean.jpg",
    icon: "🫒",
    textColor: 'light'
  }
];