# Street Flavor Food Truck

Premium, mobile-responsive site for **Street Flavor Food Truck**.

Stack: Next.js (App Router) · TypeScript · Tailwind CSS · Lucide React · `next/font` · `next/image`

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
npm run lint
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero, features, menu preview, locations, gallery, about, CTA |
| `/menu` | Full menu with filters + cart |
| `/locations` | Weekly schedule + geolocation distance |
| `/catering` | Packages, inquiry form, FAQs |

## Image replacement

All remote image URLs live in [`data/images.ts`](data/images.ts) (also referenced from [`data/menu.ts`](data/menu.ts) and [`data/gallery.ts`](data/gallery.ts)).

To use local files:

1. Add JPGs under `public/images/` using the names in `localImageFiles` inside `data/images.ts`.
2. Point each key in `images` to the matching `/images/...` path.
3. `next.config.ts` already allows `images.unsplash.com` for temporary remote assets.

## Cart

Persists in `localStorage` (`street-flavor-cart`). Checkout is a placeholder alert (no Stripe).

## Deploy (Vercel)

1. Push to GitHub (e.g. `https://github.com/ODIOdev/foodtruck.git`).
2. Import in Vercel with Next.js defaults (`npm run build`).

## Project layout

```
app/                 # routes + globals
components/          # UI sections, cart, header/footer
data/                # menu, locations, gallery, images, nav
lib/                 # types + utils
public/images/       # local asset drop zone
```
