import type { MenuItem } from "@/lib/types";
import { images } from "@/data/images";

export const menuCategories = [
  "All",
  "Tacos",
  "Burgers",
  "Bowls",
  "Sides",
  "Drinks",
] as const;

export const menuItems: MenuItem[] = [
  {
    id: "street-tacos",
    name: "Street Tacos",
    category: "Tacos",
    description:
      "Marinated grilled meat, onions, cilantro, house sauce.",
    longDescription:
      "Three soft corn tortillas loaded with marinated grilled meat, diced onion, fresh cilantro, and our house sauce. Built for the sidewalk — messy in the best way.",
    price: 12,
    image: images.streetTacos,
    featured: true,
    serves: "3 tacos",
    heat: "mild",
    includes: ["Corn tortillas", "Grilled meat", "Onion & cilantro", "House sauce"],
    allergens: ["Contains: corn"],
  },
  {
    id: "birria-tacos",
    name: "Birria Tacos",
    category: "Tacos",
    description:
      "Slow-braised beef, melted cheese, consommé for dipping.",
    longDescription:
      "Slow-braised beef tucked into crispy-edged tortillas with melted cheese, served with a cup of rich consommé for dipping. Weekend energy, every day.",
    price: 14,
    image: images.birriaTacos,
    serves: "3 tacos + consommé",
    heat: "medium",
    includes: ["Braised beef", "Melted cheese", "Crispy tortillas", "Consommé"],
    allergens: ["Contains: dairy"],
  },
  {
    id: "chicken-tacos",
    name: "Chicken Tacos",
    category: "Tacos",
    description:
      "Citrus-marinated chicken, pickled onion, avocado crema.",
    longDescription:
      "Citrus-marinated chicken piled onto soft tortillas with bright pickled onion and cool avocado crema. Fresh, sharp, and easy to finish in three bites.",
    price: 12,
    image: images.chickenTacos,
    serves: "3 tacos",
    heat: "mild",
    includes: ["Citrus chicken", "Pickled onion", "Avocado crema", "Corn tortillas"],
    allergens: ["Contains: avocado"],
  },
  {
    id: "smash-burger",
    name: "Smash Burger",
    category: "Burgers",
    description:
      "Smash patty, cheese, pickles, onions, street sauce.",
    longDescription:
      "A thin smash patty with crispy lace edges, melted cheese, pickles, onions, and street sauce on a toasted bun. The classic truck order for a reason.",
    price: 13,
    image: images.smashBurger,
    featured: true,
    serves: "1 burger",
    heat: "mild",
    includes: ["Smash patty", "Cheese", "Pickles & onions", "Street sauce", "Toasted bun"],
    allergens: ["Contains: gluten, dairy"],
  },
  {
    id: "double-street-burger",
    name: "Double Street Burger",
    category: "Burgers",
    description:
      "Two smash patties, cheddar, bacon, crispy onions.",
    longDescription:
      "Two smash patties stacked with cheddar, bacon, and crispy onions. Bigger bite, same street-side heat — made for when one patty isn’t enough.",
    price: 16,
    image: images.doubleBurger,
    serves: "1 burger",
    heat: "mild",
    includes: ["Two smash patties", "Cheddar", "Bacon", "Crispy onions", "Toasted bun"],
    allergens: ["Contains: gluten, dairy"],
  },
  {
    id: "spicy-chicken-sandwich",
    name: "Spicy Chicken Sandwich",
    category: "Burgers",
    description:
      "Crispy thigh, hot honey, slaw, pickles on a toasted bun.",
    longDescription:
      "Crispy chicken thigh with hot honey glaze, cool slaw, and pickles on a toasted bun. Sweet heat that hits hard without burying the crunch.",
    price: 14,
    image: images.spicyChicken,
    serves: "1 sandwich",
    heat: "hot",
    includes: ["Crispy chicken thigh", "Hot honey", "Slaw", "Pickles", "Toasted bun"],
    allergens: ["Contains: gluten"],
  },
  {
    id: "korean-bowl",
    name: "Korean Bowl",
    category: "Bowls",
    description:
      "Marinated protein, rice, slaw, kimchi, spicy aioli.",
    longDescription:
      "Marinated protein over rice with crisp slaw, kimchi, and spicy aioli. Balanced heat and crunch in one bowl — no fork wrestling required.",
    price: 13,
    image: images.koreanBowl,
    featured: true,
    serves: "1 bowl",
    heat: "medium",
    includes: ["Marinated protein", "Rice", "Slaw", "Kimchi", "Spicy aioli"],
    allergens: ["Contains: soy, egg"],
  },
  {
    id: "street-rice-bowl",
    name: "Street Rice Bowl",
    category: "Bowls",
    description:
      "Cilantro rice, grilled steak, pico, cotija, lime.",
    longDescription:
      "Cilantro rice topped with grilled steak, fresh pico, cotija, and a squeeze of lime. A full plate that still eats clean from the cart.",
    price: 13,
    image: images.streetRiceBowl,
    serves: "1 bowl",
    heat: "mild",
    includes: ["Cilantro rice", "Grilled steak", "Pico de gallo", "Cotija", "Lime"],
    allergens: ["Contains: dairy"],
  },
  {
    id: "veggie-bowl",
    name: "Veggie Bowl",
    category: "Bowls",
    description:
      "Roasted squash, black beans, greens, chili-lime vinaigrette.",
    longDescription:
      "Roasted squash, black beans, and greens finished with chili-lime vinaigrette. Hearty without the heavy — built for the plant-forward line.",
    price: 12,
    image: images.veggieBowl,
    serves: "1 bowl",
    heat: "mild",
    includes: ["Roasted squash", "Black beans", "Greens", "Chili-lime vinaigrette"],
  },
  {
    id: "loaded-fries",
    name: "Loaded Fries",
    category: "Sides",
    description:
      "Crispy fries, cheese sauce, bacon, scallions, special sauce.",
    longDescription:
      "Crispy fries buried under cheese sauce, bacon, scallions, and special sauce. Share if you must — most don’t.",
    price: 11,
    image: images.loadedFries,
    featured: true,
    serves: "1 large side",
    heat: "mild",
    includes: ["Crispy fries", "Cheese sauce", "Bacon", "Scallions", "Special sauce"],
    allergens: ["Contains: dairy"],
  },
  {
    id: "street-corn",
    name: "Street Corn",
    category: "Sides",
    description:
      "Charred corn, mayo, chili powder, cotija, lime.",
    longDescription:
      "Charred corn with mayo, chili powder, cotija, and lime. Smoky, creamy, and bright — the side that steals the order.",
    price: 7,
    image: images.streetCorn,
    serves: "1 ear / cup",
    heat: "medium",
    includes: ["Charred corn", "Mayo", "Chili powder", "Cotija", "Lime"],
    allergens: ["Contains: dairy, egg"],
  },
  {
    id: "crispy-plantains",
    name: "Crispy Plantains",
    category: "Sides",
    description:
      "Golden plantains with garlic aioli and sea salt.",
    longDescription:
      "Golden fried plantains with garlic aioli and sea salt. Sweet edges, savory dip — a simple side that disappears fast.",
    price: 8,
    image: images.plantains,
    serves: "1 side",
    heat: "mild",
    includes: ["Fried plantains", "Garlic aioli", "Sea salt"],
    allergens: ["Contains: egg"],
  },
  {
    id: "house-lemonade",
    name: "House Lemonade",
    category: "Drinks",
    description: "Fresh-squeezed lemons, cane sugar, mint.",
    longDescription:
      "Fresh-squeezed lemons, cane sugar, and mint over ice. Bright enough to cut through spice and grease after a heavy plate.",
    price: 4,
    image: images.lemonade,
    serves: "16 oz",
    includes: ["Fresh lemon", "Cane sugar", "Mint", "Ice"],
  },
  {
    id: "hibiscus-tea",
    name: "Hibiscus Tea",
    category: "Drinks",
    description: "Tart hibiscus iced tea with a citrus finish.",
    longDescription:
      "Tart hibiscus iced tea with a clean citrus finish. Light, floral, and made to cool down a hot order.",
    price: 4,
    image: images.hibiscusTea,
    serves: "16 oz",
    includes: ["Hibiscus tea", "Citrus", "Ice"],
  },
  {
    id: "bottled-water",
    name: "Bottled Water",
    category: "Drinks",
    description: "Still spring water, ice-cold from the truck.",
    longDescription:
      "Still spring water, kept ice-cold on the truck. The essential reset between tacos and fries.",
    price: 2,
    image: images.bottledWater,
    serves: "16.9 oz bottle",
    includes: ["Spring water"],
  },
];

export function getFeaturedMenuItems() {
  return menuItems.filter((item) => item.featured);
}

export function getMenuItemById(id: string) {
  return menuItems.find((item) => item.id === id);
}

export function getRelatedMenuItems(item: MenuItem, limit = 3) {
  return menuItems
    .filter((other) => other.category === item.category && other.id !== item.id)
    .slice(0, limit);
}
