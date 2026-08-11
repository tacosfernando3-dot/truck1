#!/usr/bin/env python3
"""Import carts/ images + typed menu into public/images/menu and data/menu.ts / cms.json."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path("/Users/neo/Desktop/Food Truckv2")
CARTS = ROOT / "carts"
PUBLIC_MENU = ROOT / "code-x" / "public" / "images" / "menu"
MENU_TS = ROOT / "code-x" / "data" / "menu.ts"
CMS_JSON = ROOT / "code-x" / "data" / "cms.json"

CATEGORIES = [
    "Burgers",
    "Tortas",
    "Cemitas",
    "Tostadas",
    "Quesadillas",
    "Flautas",
    "Tacos - 3 Pieces",
    "Single Tacos",
    "Sides / Extras",
    "Burritos - Normal or Bowl",
    "Loaded Birria Fries",
    "Soups",
    "Nachos",
    "Drinks",
    "Elotes Street Corn",
]


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = value.replace("&", " and ")
    value = value.replace("/", " ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def auto_describe(name: str, category: str) -> tuple[str, str]:
    short = f"{name} — fresh from Los Compadres Taquería."
    long = (
        f"{name} from our {category} board. Made to order on the truck in Elmhurst, "
        f"Queens — bold flavor, street-style, ready when you are."
    )
    # Category-tuned copy
    tips = {
        "Burgers": "Stacked on a toasted bun with our house fixings.",
        "Tortas": "Pressed Mexican sandwich loaded with your choice of protein, beans, and fresh toppings.",
        "Cemitas": "Puebla-style cemita on a sesame roll with avocado, cheese, and chipotle.",
        "Tostadas": "Crispy tostada base topped with protein, crema, cheese, and salsa.",
        "Quesadillas": "Griddled tortilla packed with melted cheese and your protein of choice.",
        "Flautas": "Crispy rolled flautas, three pieces, served hot with crema and salsa.",
        "Tacos - 3 Pieces": "Three street tacos with onion, cilantro, and salsa — truck classic.",
        "Single Tacos": "One taco, done right. Order as many as you need.",
        "Sides / Extras": "Perfect add-on to round out your plate.",
        "Burritos - Normal or Bowl": "Loaded burrito — ask for bowl style if you want it fork-ready.",
        "Loaded Birria Fries": "Crispy fries drowned in birria, cheese, and consommé vibes.",
        "Soups": "Hot, rich, and made for late nights.",
        "Nachos": "Chips piled high with protein, cheese, crema, and salsa.",
        "Drinks": "Cold drinks and aguas frescas to cut the heat.",
        "Elotes Street Corn": "Street corn with mayo, cheese, chili, and lime.",
    }
    if category in tips:
        short = f"{name}. {tips[category]}"
        long = f"{name}. {tips[category]} Fresh from Los Compadres Taquería in Elmhurst, Queens."
    return short, long


def find_image(*candidates: str) -> Path | None:
    files = {p.name: p for p in CARTS.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}}
    # exact
    for c in candidates:
        if c in files:
            return files[c]
    # case-insensitive / fuzzy
    lower = {k.lower(): v for k, v in files.items()}
    for c in candidates:
        if c.lower() in lower:
            return lower[c.lower()]
    for c in candidates:
        key = c.lower().replace(" ", "")
        for name, path in lower.items():
            if key in name.replace(" ", ""):
                return path
    return None


def export_image(src: Path | None, dest_stem: str, fallback: Path | None = None) -> str:
    PUBLIC_MENU.mkdir(parents=True, exist_ok=True)
    dest = PUBLIC_MENU / f"{dest_stem}.jpg"
    source = src or fallback
    if source is None or not source.exists():
        # last resort: reuse an existing public image
        fallbacks = [
            ROOT / "code-x/public/images/street-tacos.jpg",
            ROOT / "code-x/public/images/loaded-fries.jpg",
            ROOT / "code-x/public/images/street-corn.jpg",
        ]
        for fb in fallbacks:
            if fb.exists():
                source = fb
                break
    assert source is not None
    im = Image.open(source).convert("RGB")
    im.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=82, optimize=True)
    return f"/images/menu/{dest_stem}.jpg"


def item(
    name: str,
    category: str,
    price: float,
    image_candidates: list[str],
    *,
    featured: bool = False,
    serves: str | None = None,
    price_label: str | None = None,
) -> dict:
    stem = slugify(f"{category}-{name}")
    img = export_image(find_image(*image_candidates), stem)
    desc, long = auto_describe(name, category)
    if price_label:
        desc = f"{price_label}. {desc}"
    out = {
        "id": stem,
        "name": name,
        "category": category,
        "description": desc,
        "longDescription": long,
        "price": price,
        "image": img,
        "featured": featured,
    }
    if serves:
        out["serves"] = serves
    return out


def build_menu() -> list[dict]:
    items: list[dict] = []

    # Burgers
    items += [
        item("Los Compadres Burger", "Burgers", 17, ["Los Compadres Burger .png", "Los Compadres Burger.png"], featured=True),
        item("Chicken Burger", "Burgers", 16, ["Chicken Burger .png", "Chicken Burger.png"]),
        item("Chicken Fingers", "Burgers", 11, ["Chicken Fingers.png"]),
    ]

    # Tortas
    tortas = [
        ("Milanesa de Pollo / Breaded Chicken", 13, ["Milanesa de Pollo : Breaded Chicken .png"]),
        ("Milanesa de Res / Breaded Beef", 13, ["Milanesa de Res : Breaded Beef .png"]),
        ("Asada / Steak", 13, ["Asada : Steak .png"]),
        ("Pollo / Chicken", 13, ["Pollo : Chicken .png"]),
        ("Chorizo / Pork Sausage", 13, ["Chorizo : Pork Sausage .png"]),
        ("Carnitas / Roast Pork", 13, ["Carnitas : Roast Pork .png"]),
        ("Birria / Stew Meat", 13, ["birria-stew-meat-side.png"]),
        ("Pastor / Sweet Pork", 13, ["pastor-sweet-pork-side.png"]),
    ]
    for name, price, imgs in tortas:
        items.append(item(name, "Tortas", price, imgs))

    # Cemitas
    items.append(item("Cemita", "Cemitas", 13, ["cemita.png"], featured=True))

    # Tostadas
    tostadas = [
        ("Birria", ["birria-tostadas.png"]),
        ("Carnitas", ["carnitas-tostadas.png"]),
        ("Pastor", ["pastor-tostadas.png"]),
        ("Pollo / Chicken", ["pollo-tostadas.png"]),
        ("Chorizo", ["chorizo-tostadas.png"]),
        ("Camaron / Shrimp", ["camaron-tostadas.png"]),
        ("Vegetariano / Vegetarian", ["vegetariano-tostadas.png"]),
        ("Asada / Steak", ["asada-tostadas.png"]),
    ]
    for name, imgs in tostadas:
        items.append(
            item(
                name,
                "Tostadas",
                5,
                imgs,
                serves="1 tostada",
                price_label="$5 each · 3 for $15",
            )
        )

    # Quesadillas
    quesadillas = [
        ("Birria / Stew Meat", 15, ["birria-quesadilla.png"]),
        ("Carnitas / Pork", 15, ["carnitas-quesadilla.png"]),
        ("Pastor / Sweet Pork", 15, ["pastor-quesadilla.png", "pastor-sweet-pork-side.png", "carnitas-quesadilla.png"]),
        ("Pollo / Chicken", 15, ["pollo-quesadilla.png"]),
        ("Chorizo / Pork Sausage", 15, ["chorizo-quesadilla.png"]),
        ("Camaron / Shrimp", 15, ["camaron-quesadilla.png"]),
        ("Vegetariano / Vegetarian", 15, ["vegetariano-quesadilla.png"]),
        ("Asada / Steak", 15, ["asada-quesadilla.png"]),
        ("Arrachera / Skirt Steak", 18, ["arrachera-skirt-steak-side.png", "asada-quesadilla.png"]),
    ]
    # Fix pastor quesadilla - no dedicated file; try fuzzy
    for name, price, imgs in quesadillas:
        items.append(item(name, "Quesadillas", price, imgs))

    # Flautas
    items.append(item("Flautas - 3 pieces", "Flautas", 14, ["flautas-3-pieces.png"], serves="3 pieces", featured=True))

    # Tacos 3 pieces
    tacos3 = [
        ("Pastor / Pork", 14, ["pastor-tacos-3-pieces.png"], False),
        ("Carnitas / Pork", 14, ["carnitas-tacos-3-pieces.png"], False),
        ("Chorizo / Pork", 14, ["chorizo-tacos-3-pieces.png"], False),
        ("Vegetariano / Veggie", 14, ["vegetariano-tacos-3-pieces.png"], False),
        ("Pollo / Chicken", 15, ["pollo-tacos-3-pieces.png"], False),
        ("Asada / Steak", 15, ["asada-tacos-3-pieces.png"], True),
        ("Camaron / Shrimp", 15, ["camaron-tacos-3-pieces.png"], False),
        ("Birria", 15, ["birria-tacos-3-pieces.png"], True),
        ("Arrachera / Skirt Steak", 18, ["arrachera-tacos-3-pieces.png"], False),
        ("Lengua / Tongue", 16, ["lengua-tacos-3-pieces.png"], False),
        ("Suadero", 15, ["suadero-tacos-3-pieces.png"], False),
        ("Campechano / Mixed Meats and Sausage", 15, ["campechano-tacos-3-pieces.png"], False),
        ("Cecina / Beef", 15, ["cecina-tacos-3-pieces.png"], False),
    ]
    for name, price, imgs, featured in tacos3:
        items.append(
            item(
                name,
                "Tacos - 3 Pieces",
                price,
                imgs,
                serves="3 tacos",
                featured=featured,
            )
        )

    # Single tacos
    items += [
        item("Standard taco", "Single Tacos", 5, ["standard-taco.png"], serves="1 taco", price_label="$5 each"),
        item("Birria taco", "Single Tacos", 5.5, ["birria-taco.png"], serves="1 taco", price_label="$5.50 each"),
        item("Lengua taco", "Single Tacos", 5.5, ["lengua-taco.png"], serves="1 taco", price_label="$5.50 each"),
    ]

    # Sides
    sides = [
        ("Guacamole with Chips", 12, ["guacamole-with-chips.png"]),
        ("Pico de Gallo with Chips", 10, ["pico-de-gallo-with-chips.png"]),
        ("Arroz / Rice", 5, ["arroz-rice.png"]),
        ("Frijol / Beans", 5, ["frijol-beans.png"]),
        ("Chips and Salsa / Sauce", 10, ["chips-and-salsa.png"]),
        ("Papas Fritas / Fries", 6, ["loaded-birria-fries.png"]),
        ("Crema / Cream", 1.5, ["crema.png"]),
        ("Chipotle Salsa / Mayo", 1.5, ["chipotle-salsa-mayo.png"]),
        ("Guacamole", 8, ["guacamole-side.png"]),
        ("Sweet Plantain / Platano Frito", 6, ["sweet-plantain.png"]),
        ("Birria / Stew Meat", 7, ["birria-stew-meat-side.png"]),
        ("Carnitas / Pork", 6, ["carnitas-pork-side.png"]),
        ("Pastor / Sweet Pork", 6, ["pastor-sweet-pork-side.png"]),
        ("Pollo / Chicken", 6, ["pollo-chicken-side.png"]),
        ("Chorizo / Pork Sausage", 6, ["chorizo-side.png"]),
        ("Camaron / Shrimp", 7, ["camaron-shrimp-side.png"]),
        ("Asada / Steak", 6, ["asada-steak-side.png"]),
        ("Arrachera / Skirt Steak", 12, ["arrachera-skirt-steak-side.png"]),
        ("Elote / Corn", 5, ["elotes-street-corn.png"]),
    ]
    for name, price, imgs in sides:
        items.append(item(name, "Sides / Extras", price, imgs))

    # Burritos
    burritos = [
        ("Birria / Stew Meat", 16, ["birria-burrito.png"], True),
        ("Carnitas / Pork", 16, ["carnitas-burrito.png"], False),
        ("Pastor / Sweet Pork", 16, ["pastor-burrito.png"], False),
        ("Pollo / Chicken", 16, ["pollo-burrito.png"], False),
        ("Chorizo / Pork Sausage", 16, ["chorizo-burrito.png"], False),
        ("Camaron / Shrimp", 17, ["camaron-burrito.png"], False),
        ("Vegetariano / Vegetarian", 16, ["vegetariano-burrito.png"], False),
        ("Asada / Steak", 16, ["asada-burrito.png"], False),
        ("Bistec / Skirt Steak", 20, ["bistec-skirt-steak-burrito.png"], False),
        ("Pescado / Fish", 17, ["pescado-fish-burrito.png"], False),
    ]
    for name, price, imgs, featured in burritos:
        items.append(
            item(
                name,
                "Burritos - Normal or Bowl",
                price,
                imgs,
                featured=featured,
            )
        )

    items.append(item("Loaded Birria Fries", "Loaded Birria Fries", 13, ["loaded-birria-fries.png"], featured=True))
    items.append(item("Ramen Birria", "Soups", 14, ["ramen-birria.png"], featured=True))

    nachos = [
        ("Birria / Stew Meat", ["birria-nachos.png"]),
        ("Carnitas / Pork", ["carnitas-nachos.png"]),
        ("Pastor / Pork", ["pastor-nachos.png"]),
        ("Pollo / Chicken", ["pollo-nachos.png"]),
        ("Chorizo / Sausage", ["chorizo-nachos.png"]),
        ("Camaron / Shrimp", ["camaron-nachos.png"]),
        ("Vegetariano / Vegetarian", ["vegetariano-nachos.png"]),
        ("Asada / Steak", ["asada-nachos.png"]),
    ]
    for name, imgs in nachos:
        items.append(item(name, "Nachos", 15, imgs))

    drinks = [
        ("Jarritos", 2.75, ["jarritos.png"]),
        ("Boing", 2.75, ["boing.png"]),
        ("Coca-Cola Glass Bottle", 2.75, ["coca-cola-glass-bottle.png"]),
        ("Coca-Cola Can", 2.0, ["coca-cola-can.png"]),
        ("Pepsi", 2.0, ["pepsi.png"]),
        ("Agua / Water", 1.5, ["agua-water.png"]),
        ("Horchata", 6.0, ["horchata.png"]),
        ("Jamaica", 6.0, ["jamaica.png"]),
    ]
    for name, price, imgs in drinks:
        items.append(item(name, "Drinks", price, imgs))

    items.append(item("Elotes Street Corn", "Elotes Street Corn", 5, ["elotes-street-corn.png"], featured=True))

    return items


def write_menu_ts(items: list[dict]) -> None:
    cats = ",\n  ".join(json.dumps(c) for c in ["All", *CATEGORIES])
    lines = [
        'import type { MenuItem } from "@/lib/types";',
        "",
        "export const menuCategories = [",
        f"  {cats}",
        "] as const;",
        "",
        "export const menuItems: MenuItem[] = ",
        json.dumps(items, indent=2) + ";",
        "",
        "export function getFeaturedMenuItems() {",
        "  return menuItems.filter((item) => item.featured);",
        "}",
        "",
        "export function getMenuItemById(id: string) {",
        "  return menuItems.find((item) => item.id === id);",
        "}",
        "",
        "export function getMenuItemsByCategory(category: string) {",
        "  return menuItems",
        '    .filter((item) => category === "All" || item.category === category)',
        "    .slice();",
        "}",
        "",
    ]
    MENU_TS.write_text("\n".join(lines), encoding="utf-8")


def write_cms(items: list[dict]) -> None:
    if CMS_JSON.exists():
        cms = json.loads(CMS_JSON.read_text())
    else:
        cms = {"gallery": [], "business": {}}
    cms["categories"] = CATEGORIES
    cms["menu"] = items
    business = cms.get("business") or {}
    business.update(
        {
            "name": business.get("name") or "Los Compadres Taquería",
            "shortName": business.get("shortName") or "Los Compadres",
            "phone": "(929) 283-0153",
            "streetAddress": business.get("streetAddress") or "82-12 Broadway",
            "city": business.get("city") or "Elmhurst",
            "state": business.get("state") or "NY",
            "zip": business.get("zip") or "11373",
            "footerBlurb": business.get("footerBlurb")
            or "Bold flavor on wheels. Catch us in Elmhurst, Queens and book us for your next event.",
        }
    )
    cms["business"] = business
    CMS_JSON.write_text(json.dumps(cms, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if PUBLIC_MENU.exists():
        shutil.rmtree(PUBLIC_MENU)
    PUBLIC_MENU.mkdir(parents=True, exist_ok=True)
    items = build_menu()
    write_menu_ts(items)
    write_cms(items)
    print(f"Imported {len(items)} items across {len(CATEGORIES)} categories")
    print(f"Images -> {PUBLIC_MENU}")
    print(f"Wrote {MENU_TS}")
    print(f"Wrote {CMS_JSON}")


if __name__ == "__main__":
    main()
