import { useTranslation } from "react-i18next";
import { Recipe } from "@/data/recipes";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => {
  const { t } = useTranslation();

  return (
    <div 
      className="group cursor-pointer flex flex-col gap-3"
      onClick={onClick}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] shadow-sm bg-muted/20">
        <img
          src={recipe.image}
          alt={t(`recipes.${recipe.id}.name` as any)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Etiquetas flotantes */}
        <div className="absolute bottom-3 left-3 flex gap-2 z-10">
          <span className="bg-[#FFE8D6] text-black font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
            {recipe.time} min
          </span>
          <span className="bg-[#C1F2B0] text-black font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
            {recipe.calories} kcal
          </span>
        </div>

        {/* Gradiente sutil para asegurar legibilidad si la imagen es muy clara abajo */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
      
      <h3 className="text-lg font-bold leading-tight text-foreground px-1 line-clamp-2">
        {t(`recipes.${recipe.id}.name` as any)}
      </h3>
    </div>
  );
};

export default RecipeCard;