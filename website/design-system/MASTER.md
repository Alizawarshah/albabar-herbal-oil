# البابر Herbal Oil — Design System (Master)

Made with the `frontend-design` skill and the `ui-ux-pro-max` checklist.
Page-specific changes go in `design-system/pages/<page>.md`; otherwise this file rules.

## Brief
- **Subject:** one desi herbal hair oil (4 packs), slow-cooked from 20+ herbs.
- **Audience:** Pakistani families, mostly on phones, ordering Cash on Delivery, reading English or Urdu.
- **Main job of the site:** pick a pack and order with Cash on Delivery or WhatsApp, quickly and with trust.
- **Fixed by the client:** herbal green + gold, a plain banner hero (client supplies banners), stock photos for now, English/Urdu toggle.

## Idea: the pansari label
A desi herbal shop (pansari) labels every jar on a paper label with a ruled border.
That jar-label look is used for the **product tags** (Save %, Best seller). Everything else stays quiet:
white pages, clear type, photos doing the work.
(The large ingredients-shelf section was removed at the client's request on 2026-11-25.)

## Hero
One image or one video, no slider and no text on top. Set it in `js/data.js` → `HERO`.

## Colour
| Token | Hex | Use |
|---|---|---|
| Kalonji (ink) | `#13261B` | text, dark bands, footer |
| Bhringraj (leaf) | `#2E5E3E` | primary buttons, links, active states |
| Sarson (oil gold) | `#B8862B` | rules, label borders, stars, large accents only |
| Sarson dark | `#8A6416` | gold text on light (passes 4.5:1) |
| Label paper | `#FBFAF5` | label plates, alternating section background |
| Muslin | `#EDF1EA` | photo backgrounds, input fills, quiet surfaces |
| White | `#FFFFFF` | page background |

No cream page background, no gradients, no gold-gradient buttons.

## Type
- **Rozha One** — English display (headings, prices). From a South Asian type foundry; reads like a bazaar poster. One weight, used large.
- **Hind** — English body and UI (400 / 500 / 600). Same foundry, so the pair feels related but clearly distinct.
- **Noto Nastaliq Urdu** — all Urdu, and the البابر wordmark.
- Scale (px): 13 · 16 · 20 · 25 · 31 · 39 · 49 · 61. Body 16px, line-height 1.6 (Urdu 2.1). Lines under 70 characters.
- Sentence case everywhere. No all-caps labels, no small "eyebrow" text above headings, no "→" on links, no single accented word in headings.

## Layout
- Content width 1200px; section headings **left-aligned** with a one-line description beside or under them.
- Hero = client banner only (crossfade slideshow, no text on top).
- Product tiles: photo on muslin, name, price, one outlined button. No boxed cards, no hover lift.
- Ingredients shelf (dark band): photo + jar label (English name, Urdu name, what it does). The bold moment.
- Steps (how to use, how it's made) are real sequences, so they are numbered; everything else is not.
- Reviews as a quote list with rules between, not a card grid.
- Radius hierarchy: photos 4px, buttons/inputs 6px, label tags 2px. Shadows only on overlays (cart drawer, menus).

```
┌ announcement ─────────────────────────────────────────────┐
│ logo        nav nav nav nav            اردو  search  cart │
├───────────────────────────────────────────────────────────┤
│                 BANNER (client image)                     │
├───────────────────────────────────────────────────────────┤
│ delivery | COD | 20+ herbs | WhatsApp      (one quiet row) │
│ Special deals ......................... See all bundles   │
│ [photo] [photo] [photo] [photo]                           │
│ ███ ingredients shelf: [jar label] x10 ████████████████   │
│ how to use 1 ── 2 ── 3                                    │
└───────────────────────────────────────────────────────────┘
```

## Motion
- One moment: the banner crossfade. It pauses on hover/focus and does not autoplay with reduced motion.
- Feedback motion only: cart drawer slide, accordion open, image swap on product hover.
- No scroll-triggered fade-ins.

## Quality floor (ui-ux-pro-max §1–§8)
Visible focus rings · skip link · 44px touch targets · inputs 16px with visible labels · errors under the field ·
alt text · contrast 4.5:1 for text · no horizontal scroll at 375px · `prefers-reduced-motion` respected.
