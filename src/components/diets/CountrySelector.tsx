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
    <div className="space-y-4">
        <Button 
            type="button" 
            variant="outline" 
            className="w-full text-primary gap-2 h-12 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary transition-colors mb-2" 
            onClick={handleAutoDetect}
        >
            <MapPin className="w-4 h-4" />
            {t('diets_onboarding.auto_detect') || "Detectar mi ubicación"}
        </Button>

        <div className="flex flex-col gap-2">
            {countries.map((country) => {
                const isSelected = value === country.value;
                return (
                    <motion.button
                        key={country.value}
                        type="button"
                        onClick={() => onChange(country.value)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "flex items-center gap-4 p-4 w-full rounded-xl border transition-all duration-200 outline-none text-left relative overflow-hidden",
                            isSelected 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border bg-card hover:bg-muted/50"
                        )}
                    >
                        <span className="text-3xl flex-shrink-0 leading-none">
                            {country.flag}
                        </span>
                        <span className={cn(
                            "font-medium text-base flex-1",
                            isSelected ? "text-primary" : "text-foreground"
                        )}>
                            {country.label}
                        </span>
                        
                        {isSelected && (
                            <div className="bg-primary text-white rounded-full p-1 shadow-sm">
                                <Check className="w-4 h-4" />
                            </div>
                        )}
                    </motion.button>
                )
            })}
        </div>
        
        <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-3 mt-4">
            <Globe className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
                {t('diets_onboarding.country_expansion_note')}
            </p>
        </div>
    </div>
  );
}