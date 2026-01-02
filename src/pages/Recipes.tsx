import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { recipes, Recipe } from "@/data/recipes";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeDetailDrawer from "@/components/recipes/RecipeDetailDrawer";

const Recipes = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('recipes.title', 'Recetas')}</h1>
        </header>
        
        <div className="grid grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)} 
            />
          ))}
        </div>
      </div>

      <RecipeDetailDrawer 
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </PageLayout>
  );
};

export default Recipes;