export const countries = [
  { value: "united_states", label: "Estados Unidos" },
  { value: "mexico", label: "México" },
  { value: "spain", label: "España" },
  { value: "argentina", label: "Argentina" },
  { value: "brazil", label: "Brasil" },
  { value: "dominican_republic", label: "República Dominicana" },
  { value: "colombia", label: "Colombia" },
  { value: "chile", label: "Chile" },
  { value: "peru", label: "Perú" }
].sort((a, b) => a.label.localeCompare(b.label));