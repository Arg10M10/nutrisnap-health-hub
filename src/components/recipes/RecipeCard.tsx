import { Card } from "@/components/ui/card";
import { Clock, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Recipe } from "@/data/recipes";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => {
  const { t } = useTranslation();

  return (
    <Card 
      className="group overflow-hidden rounded-2xl border-none shadow-md bg-card cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={recipe.image}
          alt={t(`recipes.${recipe.id}.name` as any)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
            {t(`recipes.${recipe.id}.name` as any)}
          </h3>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between text-xs text-muted-foreground bg-card">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{recipe.time} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>{recipe.calories} kcal</span>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;