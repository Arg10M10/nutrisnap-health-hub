"use client";

import { Check, MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { countries } from "@/data/countries";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const { t } = useTranslation();

  const handleAutoDetect = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone.includes("Mexico")) onChange("mexico");
    else if (timeZone.includes("Argentina")) onChange("argentina");
    else if (timeZone.includes("Bogota")) onChange("colombia");
    else if (timeZone.includes("Madrid") || timeZone.includes("Ceuta")) onChange("spain");
    else if (timeZone.includes("New_York") || timeZone.includes("Los_Angeles")) onChange("united_states");
    else if (timeZone.includes("Santiago")) onChange("chile");
    else if (timeZone.includes("Lima")) onChange("peru");
    else if (timeZone.includes("Sao_Paulo")) onChange("brazil");
    else if (timeZone.includes("Santo_Domingo")) onChange("dominican_republic");
    else {
        // No hacer nada si no se detecta con certeza
    }
  };

  return (
    <div className="space-y-6">
        <Button 
            type="button" 
            variant="outline" 
            className="w-full text-primary gap-2 h-12 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary transition-colors" 
            onClick={handleAutoDetect}
        >
            <MapPin className="w-4 h-4" />
            {t('diets_onboarding.auto_detect') || "Detectar mi ubicación"}
        </Button>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {countries.map((country) => {
                const isSelected = value === country.value;
                return (
                    <motion.button
                        key={country.value}
                        type="button"
                        onClick={() => onChange(country.value)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-4 min-h-[8rem] h-auto rounded-2xl border-2 transition-all duration-200 outline-none",
                            isSelected 
                                ? "border-primary bg-primary/5 shadow-md" 
                                : "border-muted bg-card hover:border-primary/30 hover:bg-muted/30"
                        )}
                    >
                        <span className="text-4xl mb-2 filter drop-shadow-sm">
                            {country.flag}
                        </span>
                        <span className={cn(
                            "text-sm font-medium text-center leading-tight transition-colors break-words w-full",
                            isSelected ? "text-primary" : "text-muted-foreground"
                        )}>
                            {country.label}
                        </span>
                        
                        {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-sm">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                    </motion.button>
                )
            })}
        </div>
        
        <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-3">
            <Globe className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
                {t('diets_onboarding.country_expansion_note')}
            </p>
        </div>
    </div>
  );
}