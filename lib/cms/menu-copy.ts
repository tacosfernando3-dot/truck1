/** Auto-generate short + long menu descriptions from name/category. */
export function autoDescribeMenuItem(name: string, category: string) {
  const tips: Record<string, string> = {
    Burgers: "Stacked on a toasted bun with our house fixings.",
    Tortas:
      "Pressed Mexican sandwich loaded with your choice of protein, beans, and fresh toppings.",
    Cemitas:
      "Puebla-style cemita on a sesame roll with avocado, cheese, and chipotle.",
    Tostadas:
      "Crispy tostada base topped with protein, crema, cheese, and salsa.",
    Quesadillas:
      "Griddled tortilla packed with melted cheese and your protein of choice.",
    Flautas:
      "Crispy rolled flautas, three pieces, served hot with crema and salsa.",
    "Tacos - 3 Pieces":
      "Three street tacos with onion, cilantro, and salsa — truck classic.",
    "Single Tacos": "One taco, done right. Order as many as you need.",
    "Sides / Extras": "Perfect add-on to round out your plate.",
    "Burritos - Normal or Bowl":
      "Loaded burrito — ask for bowl style if you want it fork-ready.",
    "Loaded Birria Fries":
      "Crispy fries drowned in birria, cheese, and consommé vibes.",
    Soups: "Hot, rich, and made for late nights.",
    Nachos: "Chips piled high with protein, cheese, crema, and salsa.",
    Drinks: "Cold drinks and aguas frescas to cut the heat.",
    "Elotes Street Corn": "Street corn with mayo, cheese, chili, and lime.",
  };

  const tip =
    tips[category] ??
    "Made to order on the truck — bold flavor, street-style.";

  return {
    description: `${name}. ${tip}`,
    longDescription: `${name}. ${tip} Fresh from Los Compadres Taquería in Elmhurst, Queens.`,
  };
}
