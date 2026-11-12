# Asset manifest

| Asset | Path | Source | Notes |
|---|---|---|---|
| Portrait (b/w + colour cut-outs) | `public/portrait/{bw,color}.webp` | owner-supplied studio photos (colour + b/w grade of the same frame) | Background removed locally with rembg `isnet-general-use`, mask eroded 2px; 900×1300 |
| Project screenshots (repo) | `public/media/{reel-studio,aeropulse-ai,kisaanraksha,faultline,reva}/` | committed images in each project's own repository | captured 2026-11-07 |
| Project screenshots (live) | `public/media/*/landing.webp` | public deployments, `scripts/capture.mjs` (read-only page loads, no sign-in) | 1440×900, 2026-11-07 |
| Certificates | `public/certificates/{thumbs,full,files}/` | `D:\Certificates` (moved off OneDrive on 12 Nov 2026; 30 files, all distinct by SHA-256) | built by `npm run certificates`; Cisco internship preview has the student ID masked and its original is not published; the two 42 MB scans are republished as compact PDFs |
| Font | Onest via `next/font/google` | Google Fonts, SIL OFL 1.1 | self-hosted at build |
| Smooth scroll | `lenis` | MIT | |

## Still wanted
- Drishti 2.0 screenshots, if you later want them instead of the icon.

- A résumé PDF, if you want a résumé link.
