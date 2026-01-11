export interface DietPlan {
  id: string;
  image: string;
  nameKey: string;
  descriptionKey: string;
  objectiveKey: string;
  idealForKey: string;
  notRecommendedKey: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
}

export const dietPlans: DietPlan[] = [
  {
    id: 'high-protein',
    image: '/diets/high-protein.jpg',
    nameKey: 'diet_plans.high_protein.name',
    descriptionKey: 'diet_plans.high_protein.description',
    objectiveKey: 'diet_plans.high_protein.objective',
    idealForKey: 'diet_plans.high_protein.ideal_for',
    notRecommendedKey: 'diet_plans.high_protein.not_recommended_for',
    macros: {
      protein: '30–40 %',
      carbs: '30–40 %',
      fats: '20–30 %'
    }
  }
];