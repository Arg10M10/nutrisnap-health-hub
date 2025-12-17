"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countries } from "@/data/countries";
import { useTranslation } from "react-i18next";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // Detectar país automáticamente (simulado con zona horaria/idioma por simplicidad)
  const handleAutoDetect = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Mapeo simple de zonas horarias comunes a países de la lista
    if (timeZone.includes("Mexico")) onChange("mexico");
    else if (timeZone.includes("Argentina")) onChange("argentina");
    else if (timeZone.includes("Bogota")) onChange("colombia");
    else if (timeZone.includes("Madrid") || timeZone.includes("Ceuta")) onChange("spain");
    else if (timeZone.includes("New_York") || timeZone.includes("Los_Angeles")) onChange("united_states");
    else if (timeZone.includes("Santiago")) onChange("chile");
    else if (timeZone.includes("Lima")) onChange("peru");
    else {
        // Fallback genérico si no coincide exactamente
        onChange(""); 
    }
  };

  return (
    <div className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-14 text-lg px-4"
            >
            {value
                ? countries.find((country) => country.value === value)?.label
                : t('diets_onboarding.select_country') || "Seleccionar país..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
            <CommandInput placeholder={t('diets_onboarding.search_country') || "Buscar país..."} />
            <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                {countries.map((country) => (
                    <CommandItem
                    key={country.value}
                    value={country.label} // Usamos label para la búsqueda
                    onSelect={() => {
                        onChange(country.value);
                        setOpen(false);
                    }}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        value === country.value ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {country.label}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
        
        <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-primary gap-2" 
            onClick={handleAutoDetect}
        >
            <MapPin className="w-4 h-4" />
            {t('diets_onboarding.auto_detect') || "Detectar mi ubicación"}
        </Button>
    </div>
  );
}