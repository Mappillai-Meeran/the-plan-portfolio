# THE PLAN — Mappillai Meeran A

An original cinematic portfolio built with HTML, CSS and vanilla JavaScript, inspired by the tension and planning atmosphere of the Money Heist series. The visual direction is a heist-planning dossier: blueprint routes, evidence files, red string, field maps, restrained route motion and a vault archive. It does not use the show's characters, costumes, masks, music or artwork.

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
- **Featured project panels:** the panels near the top of the page are original CSS interface mockups, not captured screenshots. Replace them with verified project imagery when available.
- **Project repositories:** add a project-specific repository URL only when you have confirmed the correct URL.
- **Vault easter egg:** change `keypadCode` in the `CONFIG` object near the top of `script.js` and update the matching clue in the personnel file in `index.html`. It is a frontend-only surprise, not security.
- **Certificates:** add credential URLs only after checking the original certificates.

The contact email is configured in the two mail links in `index.html`.

## Motion and accessibility
- Lenis is driven by one GSAP ticker; ScrollTrigger receives Lenis scroll updates.
- The hero name resolves once from placeholder glyphs and the role line types in; featured project cards reveal as they enter view.
- Scroll scenes use restrained transforms, opacity and SVG route drawing.
- A scroll-revealed obstacle board maps challenges in INAI, Nirvaha and SentinelGrid to the tools used to address them.
- Case-file dials and the vault keypad are optional. All written content and navigation remain accessible without completing them.
- The vault keypad is a frontend-only easter egg, not access control; its clue is in the personnel file.
- Reduced-motion preferences disable smooth scrolling and scroll choreography.
- Mobile layouts simplify the decorative scenes and keep content readable.

## Theme
- **Night Job:** charcoal, signal red and low-light dossier atmosphere, with an original Money Heist-inspired presentation.
- **Blueprint Day:** warm paper, blueprint grid and deep red/blue accents.
- Theme choice is stored in localStorage; first visit follows system preference.

## Deploy
The GitHub Actions workflow publishes the repository root to GitHub Pages when changes are pushed to `main`. Review the branch and its assets before merging or publishing.

## Editing
- Content and asset paths: `index.html`
- Visual styling and responsive rules: `style.css`
- Timing, interactions and scroll choreography: `script.js` → `CONFIG`
