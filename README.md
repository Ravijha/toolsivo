# Toolsivo.com

40 free, private, in-browser tools built with Next.js (App Router), React, HTML Canvas and Web APIs.
Nothing is uploaded — every file is processed on the user's device.

## Run

```bash
npm install      # also copies PDF.js into public/pdfjs
npm run dev      # http://localhost:3000
npm run build    # static site in out/
npm start        # preview out/ locally
```

## Structure

| Path | What |
| --- | --- |
| `lib/tools.js` | Registry of categories and tools (names, slugs, icons, SEO text). Add a tool here first. |
| `components/ToolRenderer.js` | Maps each slug to its lazily loaded tool component. |
| `tools/*.js` | One file per tool (some, like `FormatConverter` and `CanvasResizer`, power several slugs). |
| `components/ui.js` | Shared UI kit: dropzone, sliders, segmented controls, stats, donut chart. |
| `components/Cropper.js`, `PdfKit.js` | Interactive crop box; PDF loading + page thumbnails. |
| `lib/` | File/download helpers, ZIP writer, PDF.js loader, colour and date maths. |
| `app/` | Home, `/tools`, `/tools/[slug]`, `/category/[id]`, privacy, 404. All statically generated. |

## Adding a tool

1. Add an entry to `tools` in `lib/tools.js`.
2. Create `tools/MyTool.js` (a `"use client"` component).
3. Register it in `components/ToolRenderer.js`.

Tax/GST calculators use FY 2025-26 rules and are estimates only.

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`. In the repo go to **Settings → Pages → Source** and pick **GitHub Actions**.

## Contact form

Messages are delivered to **toolsivo@gmail.com** through [FormSubmit](https://formsubmit.co) (no server needed).
The very first submission triggers an activation email to that inbox — click **Activate Form** once, then all messages arrive normally.

## SEO & AdSense

- Every page has its own title, description, keywords, canonical URL, Open Graph/Twitter tags and schema.org data (`lib/site.js`).
- `sitemap.xml`, `robots.txt` and `manifest.webmanifest` are generated at build time.
- Optional GitHub repository variables (**Settings → Secrets and variables → Actions → Variables**), no code changes needed:
  - `GOOGLE_SITE_VERIFICATION` — the content value of Search Console’s HTML-tag verification.
  - `ADSENSE_CLIENT` — your AdSense publisher ID, e.g. `ca-pub-1234567890123456`. Adds the AdSense script, the `google-adsense-account` meta tag and `ads.txt`.
