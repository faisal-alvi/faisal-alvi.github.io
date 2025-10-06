## Faisal Alvi – Personal Site

A lightweight static personal website focused on high‑performing WordPress and WooCommerce solutions. Built on a customized Meyawo layout with enhanced, responsive styling.

### Overview
- **Entry point**: `index.html`
- **Styles**: `assets/css/meyawo.css` (vendor) and `assets/css/custom.css` (your overrides)
- **Scripts**: `assets/vendors/jquery/*`, `assets/vendors/bootstrap/*`, and `assets/js/meyawo.js`
- **Images**: `assets/imgs/`

This site currently lives inside a WordPress project at `wp-content/plugins/faisal-alvi.github.io`, but it’s self‑contained and does not rely on WordPress hooks.

### Getting Started
1. Open `index.html` in a browser to preview.
2. Edit content directly in `index.html` (Header, Services, Contact, Footer, social links).
3. Adjust visuals in `assets/css/custom.css` (preferred) instead of touching vendor CSS.

### Key Files
- `index.html`: Main content and sections.
- `assets/css/custom.css`: Custom header layout, trust indicators, services cards, contact CTA, and responsive rules.
- `assets/imgs/me-amsterdam.jpg`: Current header photo. Replace the image or update the `src` in `index.html`.

### Editing Content
- **Header**: Inside `.header-text` (subtitle, 3 short paragraphs, and CTAs).
- **Trust indicators**: Small cards near the photo (e.g., “12+ Years Experience”, “100+ Projects Delivered”).
- **Services**: Each card has a title, short description, and bullet list.
- **Contact**: Headline, supporting paragraph, and buttons/links.

### Styling Guidelines
- Use `assets/css/custom.css` for all changes.
- Color theme uses a unified purple `#6c5ce7` for icons and accents.
- Responsive breakpoints tuned at 1200px, 991px, 768px, 576px, and 400px.

### Images
- Place assets in `assets/imgs/`.
- Prefer optimized WebP/JPG where possible.
- Header photo works best when roughly square for a clean circular crop.

### Optional SCSS
SCSS sources exist in `assets/scss/` (from the original theme). If you prefer SCSS, set up your build to compile into `assets/css/`. Otherwise, continue editing `custom.css` directly.

### Deployment
This is a static site:
- Host on any static provider (GitHub Pages, Netlify, Vercel, etc.).
- Or keep within your WordPress project and route to it as needed.

No build step required; files are ready to deploy.

### Notes
- Avoid editing vendor files like `assets/css/meyawo.css` to simplify updates.
- Keep copy aligned with your resume: WordPress solutions, WooCommerce expertise, performance optimization, and open‑source contributions.

### License
This project includes third‑party assets (icons, theme CSS/JS). Follow their respective licenses. Your original content and `custom.css` are yours to license as you prefer.
