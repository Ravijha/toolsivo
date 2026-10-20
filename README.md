<<<<<<< HEAD
# Toolora.com

40 free, private, in-browser tools built with Next.js (App Router), React, HTML Canvas and Web APIs.
Nothing is uploaded — every file is processed on the user's device.

## Run

```bash
npm install      # also copies PDF.js into public/pdfjs
npm run dev      # http://localhost:3000
npm run build && npm start
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
=======
# toolsivo
>>>>>>> e223c9c84aacbe862baa897be1b41d29de43777d
