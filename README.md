# lead.castara.io

A scroll-driven narrative landing page that argues one thing: **a website's job is to turn visitors into leads — and most don't do it.**

The page is the proof of its own point. It opens in a pale, "dead" state and travels into a charged dark one as you scroll, with a word-by-word ignition sequence at its core. Built for service businesses.

## Stack

- Hand-coded **HTML / CSS / JS** — no framework, no CMS, no build step
- **GSAP + ScrollTrigger** for the scroll choreography (loaded via CDN)
- Static deploy on **Vercel**

## Design

- **Type:** Archivo Black (headlines) · Space Grotesk (body) · Space Mono (labels) · Orbitron (brand mark) · Fraunces (the quote)
- **Color journey:** pale paper `#ECEAE3` → void `#07080A`, scrubbed to scroll progress
- **Accent:** a lime that deepens to `#8FB300` on light backgrounds and glows to `#D6FF3F` on dark
- **Signature:** the pinned, word-by-word "ignition" passage — dead text coming alive as you scroll

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup, semantic structure, JSON-LD schema |
| `style.css` | Tokens, type scale, the light→dark journey, responsive layout |
| `script.js` | GSAP scroll engine, color journey, reveals, ignition |
| `vercel.json` | Clean URLs + security headers |
| `robots.txt` / `sitemap.xml` | Indexing |

## Run locally

It's static — open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Accessibility / resilience

If JavaScript or GSAP fails to load, or the visitor prefers reduced motion, all content stays visible and the light→dark journey still works on plain scroll. The animation is an enhancement, never a dependency.

---

Built by [castara.io](https://castara.io) — websites for service businesses, built to do their job.
