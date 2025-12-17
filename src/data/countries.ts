export const countries = [
  { value: "united_states", label: "Estados Unidos", flag: "🇺🇸" },
  { value: "mexico", label: "México", flag: "🇲🇽" },
  { value: "spain", label: "España", flag: "🇪🇸" },
  { value: "argentina", label: "Argentina", flag: "🇦🇷" },
  { value: "brazil", label: "Brasil", flag: "🇧🇷" },
  { value: "dominican_republic", label: "R. Dominicana", flag: "🇩🇴" },
  { value: "colombia", label: "Colombia", flag: "🇨🇴" },
  { value: "chile", label: "Chile", flag: "🇨🇱" },
  { value: "peru", label: "Perú", flag: "🇵🇪" }
].sort((a, b) => a.label.localeCompare(b.label));