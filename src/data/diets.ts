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
    icon: "💪"
  },
  {
    id: "balanced",
    nameKey: "diet_types_data.balanced.name",
    shortDescKey: "diet_types_data.balanced.short_desc",
    descriptionKey: "diet_types_data.balanced.description",
    objectiveKey: "diet_types_data.balanced.objective",
    idealForKeys: [
      "diet_types_data.balanced.ideal_for_1",
      "diet_types_data.balanced.ideal_for_2",
      "diet_types_data.balanced.ideal_for_3"
    ],
    notRecommendedForKeys: [
      "diet_types_data.balanced.not_recommended_for_1"
    ],
    macros: {
      protein: "20–25 %",
      carbs: "45–55 %",
      fats: "25–30 %"
    },
    image: "/diets/balanced-diet.jpg",
    icon: "⚖️"
  }
];