# THE PLAN — Mappillai Meeran A

An original cinematic portfolio built with HTML, CSS and vanilla JavaScript. The visual direction is a heist-planning dossier: blueprint routes, secure doors, evidence files, red string, field maps and a vault archive. It does not use Money Heist branding, characters, costumes, masks, music or artwork.

## Stack
- HTML5, CSS3 and vanilla JavaScript
- GSAP 3 + ScrollTrigger (CDN)
- Lenis smooth scrolling (CDN)
- Google Fonts: DM Sans, DM Mono and Special Elite
- GitHub Pages via GitHub Actions

No framework, bundler or build step is required.

## Run locally
Open `index.html` or run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Personal assets to add
- **Resume:** place your PDF at `resume.pdf` in the repository root. The download button already points there.
- **Project screenshots:** add image files under `assets/screenshots/`, then set the matching `data-case-image` value on each project's `img` in `index.html`. Leave it empty to keep the image slot hidden.
- **Project repositories:** add a project-specific repository URL only when you have confirmed the correct URL. No generic profile links are used as substitutes.
- **Certificates:** add credential URLs only after checking the original certificates.

The contact email is configured in the two mail links in `index.html`.

## Motion and accessibility
- Lenis is driven by one GSAP ticker; ScrollTrigger receives Lenis scroll updates.
- Scroll scenes use transforms, opacity and SVG stroke drawing.
- Case-file dials and the vault keypad are optional. All written content and navigation remain accessible without completing them.
- Reduced-motion preferences disable smooth scrolling and scroll choreography.
- Mobile layouts simplify the decorative scenes and keep content readable.

## Theme
- **Night Job:** charcoal, signal red and low-light dossier atmosphere.
- **Blueprint Day:** warm paper, blueprint grid and deep red/blue accents.
- Theme choice is stored in localStorage; first visit follows system preference.

## Deploy
The GitHub Actions workflow publishes the repository root to GitHub Pages when changes are pushed to `main`. Review the branch and its assets before merging or publishing.

## Editing
- Content and asset paths: `index.html`
- Visual styling and responsive rules: `style.css`
- Timing, interactions and scroll choreography: `script.js` → `CONFIG`
