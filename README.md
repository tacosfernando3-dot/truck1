# Los Compadres Taquería

Premium, mobile-responsive site for **Los Compadres Taquería**.

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

## Deploy targets

| Service | Target |
|---------|--------|
| GitHub | [tacosfernando3-dot/truck1](https://github.com/tacosfernando3-dot/truck1.git) |
| Vercel | Team **Los Compadres Taqueria** · project `truck1` · [vercel.com/tacosfernando3-9529](https://vercel.com/tacosfernando3-9529) |
| Supabase | [pwptpxvhdlscyebbqgkt](https://pwptpxvhdlscyebbqgkt.supabase.co) |

```bash
# Push (remote is named truck1)
git push truck1 main
```

Vercel auto-deploys from the GitHub `main` branch. Set these env vars on the Vercel project:

- `ADMIN_PASSWORD`, `ADMIN_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL=https://pwptpxvhdlscyebbqgkt.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Project layout

```
app/                 # routes + globals
components/          # UI sections, cart, header/footer
data/                # menu, locations, gallery, images, nav
lib/                 # types + utils
public/images/       # local asset drop zone
```
