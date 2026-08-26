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

## Deploy targets (locked)

| Service | Locked target |
|---------|----------------|
| GitHub | [tacosfernando3-dot/truck1](https://github.com/tacosfernando3-dot/truck1.git) — remote `truck1`, branch `main` |
| Vercel | Team **Los Compadres Taqueria** (`team_B5lEl3kRAYWPFqvq1yeSCnvW`) · project `truck1` (`prj_N8vdkZkOQ4JcJF3sT1UhmBfTZFt4`) · [vercel.com/tacosfernando3-9529](https://vercel.com/tacosfernando3-9529) |
| Supabase | [https://pwptpxvhdlscyebbqgkt.supabase.co](https://pwptpxvhdlscyebbqgkt.supabase.co) |
| Live | [loscompadrestaqueriany.com](https://loscompadrestaqueriany.com) · [truck1-los-compadres-taqueria.vercel.app](https://truck1-los-compadres-taqueria.vercel.app) |

Deployment URLs like `truck1-<hash>-los-compadres-taqueria.vercel.app` rotate on every deploy. Use the stable aliases above for the live site. Do **not** push to Over Drive remotes (`origin` / `odio-dev`).

```bash
# Push only to the locked GitHub remote
git push truck1 HEAD:main
```

Vercel auto-deploys production from GitHub `main` on the Los Compadres `truck1` project. Set these env vars there:

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
