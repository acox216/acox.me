# acox.me

Personal landing page for Alex Cox — a tasteful "desktop" UI (faux menu bar +
terminal-style window) built with [Astro](https://astro.build) and TypeScript.

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # build static site to ./dist
npm run preview  # preview the production build
npm run check    # type-check (astro check)
```

## Editing content

All content and theme values live in [`src/config.ts`](src/config.ts) — name,
bio, social links, wallpaper colors, and the menu-bar dropdowns. Components read
from it, so you rarely need to touch markup or CSS.

Want a "Favorites" menu in the bar? Add an entry to `config.menus`.

## Project structure

```
src/
├── config.ts            # single source of truth (typed)
├── icons.ts             # inline SVG icons
├── layouts/Base.astro   # <html> shell, fonts, theme injection
├── components/
│   ├── MenuBar.astro     # faux macOS menu bar + live clock + dropdowns
│   └── Window.astro      # terminal-style profile window
├── pages/index.astro    # composes the page
└── styles/global.css     # global styles
public/profile.jpg        # avatar
```

## Deployment

Deployed to **Cloudflare Workers** via the `@astrojs/cloudflare` adapter.

```sh
npm run build          # prerenders all pages to ./dist/client
npx wrangler deploy    # or: npm run deploy   (build + deploy)
npm run deploy:dry-run # validate config without deploying
```

- `wrangler.jsonc` (project root) is the source of truth for the Worker name,
  compatibility settings, and bindings. On build, the adapter generates the
  actual deploy config (`dist/client/wrangler.json`) from it.
- Today every route is **static** (prerendered). Adding `export const prerender
  = false` to a route opts it into on-demand edge rendering — the adapter then
  wires up the server entrypoint (`main`) automatically.

### Git-based deploys (Workers Builds)

Connect the GitHub repo in the Cloudflare dashboard (**Workers & Pages → Create
→ Workers → Connect to Git**):

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`

> Note: the adapter adds default `SESSION` (KV) and `IMAGES` bindings. The first
> real deploy may prompt you to create/assign a KV namespace id in
> `wrangler.jsonc` if you start using Astro sessions.
