# THE PLAN — Mappillai Meeran A

A cinematic, scroll-driven personal portfolio built with plain HTML, CSS and JavaScript. The visual language is an original heist-planning dossier: blueprint paper, classified files, evidence pins, red route strings and a vault-inspired archive.

## Stack

- HTML5, CSS3 and vanilla JavaScript
- GSAP 3 + ScrollTrigger (CDN)
- Lenis smooth scrolling (CDN)
- Google Fonts: DM Sans, DM Mono and Special Elite
- GitHub Pages deployment with GitHub Actions

No React, bundler, package installation or build step is required.

## Run locally

Open `index.html` in a browser, or use a small local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Before publishing — personal details to verify

Search the files for these markers and replace them with confirmed information:

- `ADD_YOUR_EMAIL` — replace with the email address you want public.
- Project GitHub links currently point to the public GitHub profile because exact project repository URLs have not been supplied. Replace each with the exact repository URL.
- Add verified live demo links and screenshots where available.
- Check exact certificate titles and credential links against the original certificates.
- Confirm the descriptions and technologies for each project before treating them as final public claims.

The portfolio intentionally does not invent project metrics, user counts, performance claims or commercial outcomes. Tri9T AI and Keyboard DNA are intentionally excluded.

## Theme

The visitor can switch between:

- **Night Job** — charcoal, signal red and low-light dossier atmosphere.
- **Blueprint Day** — warm paper, blueprint grid and deep red/blue accents.

The preference is stored in localStorage. The first visit follows the system color preference.

## Motion and accessibility

- Lenis is driven by one GSAP ticker; ScrollTrigger updates from Lenis scroll events.
- Scroll-linked animations use transform and opacity.
- Reduced-motion preference disables smooth scrolling and scroll choreography.
- Navigation links remain ordinary anchors and work without JavaScript.
- The mobile layout keeps all project information visible without interaction gates.

## Deploy to GitHub Pages

1. In GitHub, open **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds no bundle; it publishes the repository root.
4. Wait for the **Deploy The Plan to GitHub Pages** workflow to complete.
5. The expected URL is:

   `https://mappillai-meeran.github.io/the-plan-portfolio/`

## Editing

- Colors, layout and responsive rules: `style.css`
- Animation timing and scroll behavior: `script.js` → `CONFIG`
- Portfolio content and section structure: `index.html`

## Design note

This is an original heist-thriller-inspired portfolio concept. It does not use Money Heist branding, logos, character names, costumes, masks, music or copyrighted artwork.
