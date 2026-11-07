# Sahil Karande — portfolio

Next.js (App Router) + TypeScript + plain CSS. Static: no database, no CMS, no secrets.

Live at https://thesahilkarande.vercel.app — every push to `main` redeploys it on Vercel.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start -- -p 3130
npm run test:e2e       # Playwright against :3130 (uses installed Edge; PW_CHANNEL=chrome to switch)
```

## Editing content

- **Text, roles, doors, story, card skills** — `content/site.ts`
- **Projects** — `content/projects.ts`. One record per project; `categories` decides which rooms it appears in, `slug` is its `/projects/<slug>` page. Screenshots go in `public/media/<slug>/` as WebP, referenced with `shot()` (keep width/height and provenance accurate).
- **Portrait** — replace `public/portrait/bw.webp` and `color.webp` (same size, transparent background, 900×1300).
- **Certificates** — drop files into the certificates folder and run
  `npm run certificates -- "C:\path\to\Certificates"`. It de-duplicates, renders thumbnails and full previews, and rewrites `content/certificates.generated.json`. New files appear automatically flagged "Details pending review"; describe them in `content/certificates.ts` (title, issuer, type, date and a verification link only if printed on the document). Sensitive text to mask goes in `REDACT` in `scripts/certificates.py`.

## Structure

`app/` routes · `components/` interactive pieces (cord, notebook, portrait, doors, story, card, contact, galleries) · `content/` everything a visitor reads · `docs/` audits and build status (not rendered).
