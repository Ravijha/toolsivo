// Unique explanatory text and FAQs for the Image and PDF tool pages.
const content = {
  "image-cropper-resizer": {
    about: "Cropping removes the parts of a photo you don't need, while resizing changes its pixel dimensions. Doing both in one place is the quickest way to prepare images for a website, a form upload or a social post. Pick a preset aspect ratio such as 1:1, 4:5 or 16:9, drag the crop box over the part you want to keep, then enter the exact width and height in pixels.",
    faq: [
      ["Will resizing reduce the quality of my image?", "Making an image smaller keeps it sharp. Making it much larger than the original stretches the existing pixels, so it can look soft — start from the largest photo you have."],
      ["What is an aspect ratio?", "It is the shape of the image, written as width:height. 1:1 is square, 16:9 is widescreen and 4:5 is a tall portrait often used for social feeds."],
      ["Are my photos uploaded anywhere?", "No. Cropping and resizing are done with HTML Canvas inside your browser, so the image never leaves your device."],
    ],
  },
  "jpg-to-png": {
    about: "JPG is great for photos because it compresses well, but every save loses a little detail. PNG is lossless, so it keeps every pixel exactly and is the better choice for screenshots, diagrams, text and images you plan to edit further. This converter turns one or many JPG/JPEG files into PNG at once and lets you download them individually or as a ZIP.",
    faq: [
      ["Will converting JPG to PNG improve quality?", "No. PNG preserves the image exactly as it is now, but it cannot restore detail that JPG compression already removed."],
      ["Why is my PNG larger than the JPG?", "PNG uses lossless compression, which is less aggressive than JPG for photographs. For photos, JPG or WebP usually gives a smaller file."],
      ["Does the PNG get a transparent background?", "A JPG has no transparency, so the converted PNG keeps the same solid background the photo already had."],
    ],
  },
  "png-to-jpg": {
    about: "Converting PNG to JPG can shrink large screenshots and photos dramatically, which helps when a website or form has a file-size limit. Because JPG does not support transparency, transparent areas are filled with a colour you choose, white by default. Use the quality slider to balance file size against sharpness; 80–90% is a good starting point for most images.",
    faq: [
      ["What happens to transparent parts of my PNG?", "JPG cannot store transparency, so those pixels are filled with the background colour you pick before conversion."],
      ["What JPG quality should I use?", "80–90% is visually close to the original for most photos. Lower values give smaller files but may show blocky artefacts."],
      ["Can I convert many PNG files at once?", "Yes. Add several files together and download all the converted JPGs in one ZIP."],
    ],
  },
  "image-compressor": {
    about: "Large images slow down websites and often exceed upload limits on job portals, exam forms and email. This compressor reduces the file size of JPG, PNG and WebP images by re-encoding them at a quality you control, and shows a before/after comparison so you can see exactly what changes. Smaller images load faster, use less mobile data and can improve page-speed scores.",
    faq: [
      ["How much can an image be compressed?", "Photos often shrink by 50–80% with little visible difference. Images that are already heavily compressed will shrink less."],
      ["How do I get an image under 100 KB or 200 KB?", "Lower the quality step by step and, if needed, reduce the pixel dimensions with the Image Cropper & Resizer first."],
      ["Is compression done online?", "No. All compression runs in your browser, so private photos and documents are never uploaded."],
    ],
  },
  "passport-photo-maker": {
    about: "Passport and visa photos must follow strict size rules. India's passport photo is 35 × 45 mm, the US passport and visa photo is 2 × 2 inches (51 × 51 mm), and the UK and Schengen countries use 35 × 45 mm. This tool crops your photo to the chosen size and arranges copies on a 4×6 inch or A4 sheet that you can print at home or at a photo shop.",
    faq: [
      ["What background should a passport photo have?", "Most countries require a plain white or light background, a neutral expression, eyes open and the face clearly visible. Check the official rules for your application."],
      ["How do I print passport photos at home?", "Download the 4×6 or A4 sheet and print it at 100% scale (do not use 'fit to page') on photo paper, then cut along the edges."],
      ["Will the photo be accepted by the passport office?", "The tool gives you the correct dimensions, but acceptance also depends on lighting, pose and background. Always confirm the current official requirements."],
    ],
  },
  "image-to-webp": {
    about: "WebP is a modern image format that supports both lossy and lossless compression as well as transparency. WebP files are often 25–35% smaller than comparable JPG or PNG files, which makes pages load faster. Convert JPG, PNG, GIF and BMP images to WebP in bulk and choose the quality that fits your site.",
    faq: [
      ["Do all browsers support WebP?", "Yes. Every current version of Chrome, Edge, Firefox and Safari can display WebP images."],
      ["Does WebP keep transparency?", "Yes. Transparent PNGs converted to WebP keep their transparent areas."],
      ["Are animated GIFs converted to animated WebP?", "The converter saves the first frame as a still WebP image. Use the GIF Frame Extractor if you need individual frames."],
    ],
  },
  "rotate-flip-image": {
    about: "Phone photos sometimes appear sideways, and scanned pages can come out upside down. Rotate an image by 90° or 180°, straighten it with a custom angle, or flip it horizontally to create a mirror image. The result is saved as a new file so your original stays unchanged.",
    faq: [
      ["Why does my photo look rotated on some apps but not others?", "Many cameras store orientation in EXIF data instead of rotating the pixels. Rotating here changes the pixels, so the image looks the same everywhere."],
      ["What is the difference between rotate and flip?", "Rotate turns the image around its centre. Flip mirrors it, swapping left and right (horizontal) or top and bottom (vertical)."],
      ["Does rotating reduce quality?", "Rotations of 90° and 180° keep every pixel. Custom angles need re-sampling, which can soften edges slightly."],
    ],
  },
  "image-to-text": {
    about: "Optical character recognition (OCR) reads the letters in a picture and turns them into text you can edit, search and copy. It is useful for digitising printed pages, notes, receipts and screenshots. This tool runs the open-source Tesseract engine in your browser and supports English, Hindi and more than 15 other languages.",
    faq: [
      ["How accurate is OCR?", "Clear, well-lit printed text usually gives very good results. Handwriting, low-resolution photos, unusual fonts and skewed pages reduce accuracy."],
      ["Can it read Hindi text?", "Yes. Choose Hindi as the language to recognise Devanagari script. You can also pick Bengali, Tamil, Telugu, Gujarati and other Indian languages."],
      ["Is my image sent to a server for OCR?", "No. Recognition runs on your device. Only the language data files are downloaded from Toolsivo the first time you use a language."],
    ],
  },
  "image-dpi-calculator": {
    about: "DPI (dots per inch) or PPI (pixels per inch) links an image's pixel size to its printed size. Printed photos look sharp at around 300 DPI, posters viewed from a distance can use 150 DPI, and screens are measured in PPI. Use this calculator to find the largest print size for an image, the pixels needed for a print, or the PPI of a screen.",
    faq: [
      ["What DPI do I need for printing?", "300 DPI is the standard for photos and documents viewed up close. 150–200 DPI is usually fine for posters and banners seen from further away."],
      ["Does changing DPI in metadata make an image sharper?", "No. Only the number of pixels matters. Changing the DPI value just changes the suggested print size."],
      ["How many pixels do I need for a 4×6 inch print?", "At 300 DPI you need 1200 × 1800 pixels."],
    ],
  },
  "merge-pdf": {
    about: "Merging PDFs combines several documents — such as an application form, ID proof and certificates — into a single file that is easier to email or upload. Add your PDFs, drag them into the order you need and download one combined document. Merging is done with the open-source pdf-lib library entirely in your browser.",
    faq: [
      ["Is there a limit on the number of PDFs?", "There is no fixed limit. Very large files depend on your device's memory, so a desktop handles big jobs best."],
      ["Will the merged PDF keep the original quality?", "Yes. Pages are copied as they are, so text, images and layout are unchanged."],
      ["Can I merge password-protected PDFs?", "Encrypted PDFs must be unlocked first, because their content cannot be read without the password."],
    ],
  },
  "split-pdf": {
    about: "Splitting a PDF lets you send only the pages someone needs, or break a long document into smaller parts to meet upload limits. Split every page into its own file, split by custom ranges such as 1-3, 4-10, or split every N pages. Download the parts individually or together as a ZIP file.",
    faq: [
      ["How do I enter page ranges?", "Use commas and dashes, for example 1-3, 5, 8-12. Each range becomes a separate PDF."],
      ["Does splitting change the content?", "No. The pages are copied exactly, so text stays selectable and images keep their quality."],
      ["Is my document uploaded?", "No. The PDF is processed on your device and never leaves your browser."],
    ],
  },
  "rotate-pdf": {
    about: "Scanned documents often contain pages that are sideways or upside down. Rotate individual pages or the whole document in 90° steps while seeing page thumbnails, then save a corrected PDF. Rotation is stored in the PDF itself, so the pages display correctly in every viewer.",
    faq: [
      ["Can I rotate just one page?", "Yes. Click the rotate control on any page thumbnail to turn only that page."],
      ["Will rotating reduce quality?", "No. Rotation changes the page orientation setting; the content itself is not re-compressed."],
      ["Why doesn't my PDF viewer save rotations?", "Many viewers only rotate the view temporarily. This tool writes the rotation into a new PDF file."],
    ],
  },
  "extract-pdf-pages": {
    about: "Extracting pages creates a new PDF containing only the pages you select — for example the first page of a bank statement or a single certificate from a large scan. Click page thumbnails or type ranges, and download the selection as one new document while the original file stays untouched.",
    faq: [
      ["What is the difference between extract and split?", "Extract creates one PDF from your chosen pages. Split creates several PDFs from different ranges."],
      ["Can I change the page order?", "Pages are extracted in document order. To reorder pages, extract them and then use Merge PDF."],
      ["Do extracted pages keep links and text?", "Yes. Pages are copied as they are, so text remains selectable."],
    ],
  },
  "images-to-pdf": {
    about: "Turning photos into a PDF is the easiest way to submit scanned documents, receipts or assignments as a single file. Add JPG, PNG or WebP images, arrange them in order, choose A4, Letter or a page that fits the image, set the orientation and margins, and download a PDF with one image per page.",
    faq: [
      ["Can I combine many photos into one PDF?", "Yes. Every image becomes a page in the order you arrange them."],
      ["How can I make the PDF smaller?", "Compress or resize the images first with the Image Compressor, or run the finished file through Compress PDF."],
      ["Which page size should I choose?", "A4 is standard in India and most countries; Letter is common in the USA. The fit option sizes each page to its photo."],
    ],
  },
  "compress-pdf": {
    about: "PDFs with scanned pages or large photos can be too big for email or government portals. This tool offers two approaches: lossless optimisation that cleans up the file structure without touching content, and strong compression that re-renders pages as images at a lower resolution. Compare the result and keep the version that meets your size limit.",
    faq: [
      ["Which compression mode should I use?", "Try lossless first. If the file is still too big, use strong compression — it shrinks scanned documents a lot but makes text non-selectable."],
      ["Why didn't my PDF get smaller?", "Text-only PDFs are often already compact. Compression helps most with scans and image-heavy files."],
      ["Is it safe to compress confidential PDFs here?", "Yes. Compression happens in your browser and the file is never uploaded."],
    ],
  },
};

export default content;
