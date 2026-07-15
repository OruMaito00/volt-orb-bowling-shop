# Volt-Orb Bowling Shop

A premium bowling e-commerce single-page application built with **Vue 3 + TypeScript + Vite**,
on top of the [Fake Store API](https://fakestoreapi.com). The brief left the design open,
so the store leans into a bowling identity: every bowling product ships with a real-time,
interactive **3D model viewer** rendered with Three.js, right on the product detail page.

The goal of this project is to demonstrate clean component-driven architecture, typed API
integration, attention to accessibility and responsive design, and one signature feature
(3D product visualization) that goes beyond the requested scope.

---

## Highlights

- **Interactive 3D product viewer** — each bowling ball shows a Draco-compressed GLB model
  on its detail page, rendered with Three.js (ACES filmic tone mapping, EXR HDRI for PBR
  lighting, damped OrbitControls). 
  The viewer detects WebGL support, falls back to the 2D product image if unavailable, and properly
  disposes GPU resources on unmount and on model swaps.
- **Design-system SCSS** — single source of truth for color, spacing, typography, motion
  and elevation via CSS custom properties, with a full dark-theme override block.
- **State management with Pinia** — typed stores for auth, cart, products and UI state,
  each with `localStorage` persistence where it matters.
- **39 unit tests** covering a critical UI component (`ProductCard`), the router auth guard,
  and auth-store edge cases.
- **Responsive by default** — mobile-first layout, a floating cart FAB on phones, a header
  cart link on desktop, and a swipeable "You may also like" carousel.
- **Accessible** — semantic HTML5, keyboard-navigable cards and dialogs, visible focus
  rings, `alt` text on every product image, and `prefers-reduced-motion` support.

---

## Tech Stack

| Layer            | Choice                                        |
| ---------------- | --------------------------------------------- |
| Framework        | Vue 3 (Composition API, `<script setup>`)    |
| Build tool       | Vite 6                                        |
| Language         | TypeScript (strict mode)                      |
| State            | Pinia                                          |
| Routing          | Vue Router 4 (lazy-loaded routes)             |
| Styling          | SCSS + CSS custom properties                  |
| 3D               | Three.js (lazy-loaded into ProductView chunk) |
| Testing          | Vitest + @vue/test-utils + jsdom              |
| Backend          | Fake Store API                                |
| Deployment       | GitHub Pages via GitHub Actions               |

---

## Project Structure

```
src/
├── 3d/
│   └── BowlingBallViewer.vue        # Three.js viewer (GLB + Draco + EXR HDRI)
├── assets/
├── components/
│   ├── layout/   Header.vue
│   ├── products/ ProductCard.vue
│   └── ui/        Toast, ErrorBanner, SkeletonCard, SkeletonProductDetail,
│                  ThemeToggle, CartFab
├── composables/  useToast.ts
├── data/         bowlingProducts.ts        # custom bowling catalog + 3D model paths
├── modules/
│   ├── home/        HomeView.vue
│   ├── product/     ProductView.vue         # detail view + 3D viewer + related carousel
│   ├── cart/        CartView.vue
│   ├── wishlist/    WishlistView.vue
│   ├── auth/        LoginView.vue
│   └── NotFound.vue
├── router/       index.ts                  # routes + authGuard (testable exports)
├── services/
│   └── api/fakestore.ts                   # typed API client with generic request helper
├── stores/       auth.ts, cart.ts, products.ts, ui.ts
└── styles/       _variables.scss, global.scss, ...
```

---

## The 3D Bowling Ball Viewer

The signature feature. On every bowling ball's product page, the standard 2D image is
replaced (or backed up) by a real-time 3D render:

- **Three.js + GLTFLoader + DRACOLoader** loads Draco-compressed `.glb` assets from
  `public/3Dmodels/`. The Draco decoder is self-hosted under `public/draco/` to avoid
  third-party CDN CORS issues.
- **EXR HDRI environment** (`public/images/hdri/`) is processed through `PMREMGenerator`
  for accurate PBR reflections on the ball surface.
- **ACESFilmic tone mapping** + sRGB output for filmic, physically plausible lighting.
- **Damped OrbitControls** let the user drag to rotate; panning is disabled so the ball
  stays centered.
- **WebGL detection**: if `WebGLRenderingContext` is unavailable, the component falls back
  to the 2D product image so the page never breaks.
- **Lifecycle safety**: `disposeObject()` traverses geometry, materials and textures on
  unmount and on every model swap (triggered when navigating between bowling balls via the
  "You may also like" carousel), preventing GPU memory leaks.
- **Accessibility**: respects `prefers-reduced-motion` (controls damping disabled) and
  exposes a "Drag to rotate" text hint.

The viewer is lazy-loaded, so Three.js only lands in the `ProductView` chunk and never
weighs down the home or cart routes.

---

## Acceptance Criteria Mapping

### 1. Repository and Workflow
- Public GitHub repository with a clean, feature-branch commit history (see the
  `pinia-stores`, `3d-bowling-balls` and animation/UI feature branches merged via Pull
  Requests).
- This `README.md` lives at the repo root with local setup instructions below.
- AI-tool usage paragraph included in its own section below.

### 2. Layout, Responsiveness and Accessibility
- Global layout = `Header` + `<main>` region (`src/App.vue`).
- Fully responsive: mobile-first SCSS with `respond-to()` mixins; floating cart FAB on
  phones, header cart link on desktop; swipeable related-products carousel with native
  scroll-snap.
- Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`), full keyboard
  navigation (ProductCard is operable via Enter and Space, dialogs trap focus and close on
  Escape), and `alt` attributes on every product image.

### 3. Header
- Store name/logo + dynamic category navigation.
- Categories fetched from the Fake Store API `/products/categories` endpoint and rendered
  as router-links that update the URL on filter.

### 4. Home View
- Product grid of cards (image, name, price) fetched from the API.
- Cards are clickable and route to the product detail view.
- Category filter updates the URL path (`/?category=...`) and re-fetches via the API.
- Deep-link safe: a direct visit to a filtered URL initializes the correct filter on load.

### 5. Product View
- Displays name, image, price and full description.
- For bowling products, additionally renders the interactive **3D model viewer** described
  above, plus a "You may also like" carousel of same-category products.

---

## State Management

Four Pinia stores, each fully typed:

- **`auth`** — login/logout against `/auth/login`, persists token + username to
  `localStorage`, exposes `isAuthenticated` getter.
- **`cart`** — add/remove/quantity, persists line items to `localStorage`, exposes
  `itemCount` and `totalPrice` getters.
- **`products`** — fetches products and categories, caches results, routes errors to the
  UI store for the global error banner.
- **`ui`** — theme persistence, global error state with a retry callback, and modal flags.

The router's `authGuard` protects `/wishlist` (the `requiresAuth` route meta) and redirects
unauthenticated users to `/login` with a `redirect` query param for post-login return. The
cart is intentionally left client-side and accessible without auth, matching the Fake Store
API's stateless cart model.

---

## Testing

```bash
npm run test:run
```

39 unit tests across three spec files:

| Spec                              | Covers                                                                 |
| --------------------------------- | --------------------------------------------------------------------- |
| `tests/unit/ProductCard.spec.ts`  | 13 tests — rendering, price formatting, add-to-cart, navigation, a11y  |
| `tests/unit/router.spec.ts`       | 9 tests — auth guard behavior, protected routes, 404 catch-all        |
| `tests/unit/auth.spec.ts`        | 17 tests — login/logout, token persistence, re-login edge cases       |

Tests use real Pinia stores (no mocks) and `createMemoryHistory` for the router to assert
against the actual `authGuard` exported from `src/router/index.ts`.

---

## Local Setup

Prerequisites: **Node.js 18+** and npm.

```bash
# 1. Clone the repository
git clone https://github.com/OruMaito00/bowling-shop.git
cd bowling-shop

# 2. Install dependencies
npm install

# 3. Start the dev server (defaults to http://localhost:5173)
npm run dev
```

Other scripts:

```bash
npm run build        # type-check + production build
npm run preview      # preview the production build locally
npm run type-check   # run vue-tsc without emitting
npm run test:run     # run the unit test suite once
npm run test         # run tests in watch mode
```

The app talks to the public Fake Store API, so no `.env` or backend setup is required.

---

## Deployment

The app is deployed to GitHub Pages via a GitHub Actions workflow
(`.github/workflows/deploy.yml`). On every push to `main`, the workflow:

1. Installs dependencies.
2. Runs the production build (Vite `base` path is conditional so assets resolve under the
   GitHub Pages sub-path).
3. Uploads the `dist/` artifact and publishes it to Pages.
4. Includes an SPA `404.html` fallback so client-side routes work on refresh.

Live demo: see the repository's **About** section for the Pages URL.

---

## AI Tool Usage

This project was built with AI assistance, but under a **human-owned, spec-driven workflow**:
AI accelerated execution, never replaced judgment. Below is exactly how the tools were used,
so reviewers (human or automated) can assess the discipline behind the output.

### Phase 1 — Specification and task planning (Perplexity)

Before writing any code, I used **Perplexity** to research the Fake Store API surface and
draft a **detailed, revised project specification** that maps every acceptance criterion to
concrete engineering decisions (routes, stores, components, typing, a11y, tests). From that
spec I generated the **macro tasks**, then recursively broke each macro task down into
**increasingly smaller, verifiable units** — the kind a single focused AI session can own
end-to-end. This spec-first decomposition is the single biggest lever for keeping AI output
correct: a small task with a clear acceptance check produces far fewer hallucinations than
an open-ended "build me a shop" prompt.

### Phase 2 — Development (opencode + GLM-5.2 / Kimi K2.7)

For implementation I used **opencode** as the coding agent, switching between two frontier
LLMs depending on the task: primarily **GLM-5.2**, and **Kimi K2.7** where its strengths
fit. AI assisted with three responsibilities per task:

- **Planning** — sequencing edits, choosing where code should live, flagging risks.
- **Generation** — drafting components, composables, styles, and tests.
- **Debugging** — root-causing Three.js lifecycle leaks (GLB disposal, `PMREMGenerator`
  cleanup), Vue Router transition edge cases, and Reactivity pitfalls.

Critically, **no AI output was accepted blindly.** Every snippet was treated as a draft:
I reviewed it against the project architecture and conventions, enforced strict
TypeScript types, and ran the full verification gate — `npm run type-check`,
`npm run test:run`, and `npm run build` — before committing. The commit history reflects
this human-in-the-loop cadence, not a firehose of AI output.

### Best practices I followed

These are the principles I keep current on, and that I applied here:

- **Context hygiene.** LLMs degrade and hallucinate more as a session's context grows, so I
  monitored session length and ran `/compact` to compress context back to a distilled state
  before it ballooned. Long, wandering sessions are the #1 cause of subtle AI bugs.
- **Task decomposition.** Small, well-scoped tasks with clear acceptance checks beat large
  open-ended prompts every time (see Phase 1).
- **Specialized skills, used selectively.** For a few tasks that benefited from curated
  workflows and constraints, I loaded domain-specific skills rather than free-styling
  prompts:
  - **`frontend-design`** (by Anthropic) — for intentional, non-templated visual choices.
  - **`agent-arch-system-design`** — for system-design reasoning when wiring stores, the
    retry-callback-in-store pattern for the error banner, and the cart FAB / header split.
  These were the exception, not the rule — most tasks were handled with direct, focused
  prompting against the project spec.
- **Verification gates, not vibes.** Type-check + tests + build run after every change
  batch; the repo's 39 tests exist to catch regressions AI (or I) might introduce.
- **Right model for the right job.** Switching between GLM-5.2 and Kimi K2.7 based on task
  characteristics, rather than defaulting to one model for everything.
- **Spec as source of truth — but not a straitjacket.** A written, task-checked spec
  prevents AI drift from the original intent across a long project. That said, I treated it
  as a living document: in a few cases I questioned the pre-determined task list mid-stream,
  made minor changes, or deviated when a concrete engineering decision warranted it. A spec
  is a plan, not a contract — the commit history shows where the plan was deliberately
  revised.

### Staying current

The tooling and model landscape moves fast. I keep up by tracking release notes for the
models I use, evaluating new agents/skills against concrete tasks rather than benchmarks,
and treating each AI workflow decision as something to justify — not assume. The practices
above are intentionally tool-agnostic: they survive the next model or agent upgrade.
