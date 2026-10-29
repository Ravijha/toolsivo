// Unique explanatory text and FAQs for the Text, Design and Media tool pages.
const content = {
  "word-counter": {
    about: "Essays, articles, social posts and form fields often have word or character limits. Paste or type your text to count words, characters with and without spaces, sentences and paragraphs as you write. Reading time and keyword density help writers and bloggers check length and avoid repeating the same words too often.",
    faq: [
      ["How is reading time estimated?", "It assumes an average adult reading speed of about 200–250 words per minute."],
      ["Are Hindi words counted correctly?", "Yes. Words are separated by spaces and punctuation, so Devanagari text is counted the same way as English."],
      ["Is my text saved?", "No. Counting happens in your browser and the text is never stored or uploaded."],
    ],
  },
  "remove-duplicate-lines": {
    about: "Lists of emails, keywords, product codes or URLs often contain repeated entries. Paste the list to remove duplicate lines instantly, with options to ignore letter case, trim extra spaces, drop empty lines and sort the result. The tool shows how many duplicates were removed.",
    faq: [
      ["Does it keep the first or last copy of a duplicate?", "It keeps the first occurrence and removes later repeats, so your original order is preserved unless you choose to sort."],
      ["Can it treat 'Apple' and 'apple' as the same?", "Yes. Turn on the ignore-case option."],
      ["How many lines can it handle?", "Tens of thousands of lines are processed in a moment on a normal computer."],
    ],
  },
  "case-converter": {
    about: "Change text between UPPERCASE, lowercase, Title Case and Sentence case for documents, or camelCase, snake_case and kebab-case for code and file names. It is a quick fix for text typed with Caps Lock on, headings that need consistent capitalisation, or variable names copied from another language.",
    faq: [
      ["What is the difference between Title Case and Sentence case?", "Title Case capitalises the main words of a heading. Sentence case capitalises only the first word and proper nouns."],
      ["What are camelCase, snake_case and kebab-case?", "They are naming styles for code: camelCase joins words with capitals, snake_case uses underscores and kebab-case uses hyphens."],
      ["Does it work with Hindi text?", "Devanagari has no upper or lower case, so Hindi text stays unchanged while English words are converted."],
    ],
  },
  "line-break-remover": {
    about: "Text copied from PDFs, emails and websites often has a line break at the end of every line, which looks broken when pasted elsewhere. Remove unwanted line breaks while keeping paragraph breaks, or replace every break with a space, comma or any separator you choose.",
    faq: [
      ["Why does text copied from a PDF have broken lines?", "PDFs store each visual line separately, so copying adds a line break wherever the original line ended."],
      ["Can I keep paragraph breaks?", "Yes. Choose the option to keep paragraphs so only single line breaks inside paragraphs are removed."],
      ["Can I turn a list into comma-separated values?", "Yes. Replace line breaks with a comma and space."],
    ],
  },
  "text-compare": {
    about: "Find exactly what changed between two versions of a document, contract, code snippet or list. Paste the original and the new text to see added, removed and unchanged lines highlighted side by side. The comparison runs in your browser, so confidential drafts stay private.",
    faq: [
      ["How does the comparison work?", "It finds the longest common sequence of lines between the two texts and marks everything else as added or removed."],
      ["Can it ignore whitespace or case differences?", "Use the available options to ignore changes that do not matter, such as extra spaces."],
      ["Can I compare Word or PDF files?", "Copy the text out of the files and paste it into the two boxes."],
    ],
  },
  "slug-generator": {
    about: "A slug is the readable part of a URL that identifies a page, like /tools/word-counter/. Good slugs are short, lowercase and use hyphens between words, which helps both visitors and search engines understand the page. Turn titles into clean slugs one at a time or in bulk, with accents and special characters removed.",
    faq: [
      ["Should slugs use hyphens or underscores?", "Use hyphens. Google treats hyphens as word separators but may join words connected by underscores."],
      ["Should I remove stop words like 'the' and 'and'?", "Removing them keeps slugs short, but keep any word needed for the meaning."],
      ["Can I change a slug after publishing?", "Yes, but set up a 301 redirect from the old URL so you don't lose visitors or rankings."],
    ],
  },
  "lorem-ipsum-generator": {
    about: "Lorem ipsum is scrambled Latin placeholder text used by designers and developers to fill layouts before the real content is ready, so attention stays on the design. Generate the number of paragraphs, sentences or words you need as plain text or HTML paragraphs.",
    faq: [
      ["Where does lorem ipsum come from?", "It is derived from a passage of Cicero's 'De finibus bonorum et malorum', written in 45 BC, with words altered and removed."],
      ["Why not use real text in mockups?", "Readable text draws attention to the words instead of the layout. Replace placeholders with real content before publishing."],
      ["Can I get HTML output?", "Yes. Choose HTML to wrap each paragraph in <p> tags."],
    ],
  },
  "case-sensitive-text-analyzer": {
    about: "See how letter case is used in any text: counts of uppercase and lowercase letters, words written in ALL CAPS or Title Case, and words that appear with different capitalisation, such as 'Email', 'email' and 'EMAIL'. Writers and editors use it to keep brand names, headings and terms consistent.",
    faq: [
      ["Why check for inconsistent capitalisation?", "Mixed spellings of the same term look careless in documents and can confuse case-sensitive systems such as passwords and code."],
      ["Does it count numbers and symbols?", "They are counted separately from letters, which have upper and lower case."],
      ["Is my text uploaded?", "No. Analysis happens entirely in your browser."],
    ],
  },
  "character-frequency-counter": {
    about: "Count how often every letter, digit, symbol, space and emoji appears in a text, with percentages and a chart. Character frequency is used in cryptography puzzles, language study, data cleaning and checking whether a sentence is a pangram that uses every letter of the alphabet. Export the table as CSV for further analysis.",
    faq: [
      ["What is the most common letter in English?", "E is the most frequent letter in typical English text, followed by T, A and O."],
      ["What is a pangram?", "A sentence that uses every letter of the alphabet at least once, such as 'The quick brown fox jumps over the lazy dog'."],
      ["Can it count emoji and Hindi characters?", "Yes. Characters are counted by Unicode code point, so emoji and Devanagari are handled."],
    ],
  },
  "unicode-character-inspector": {
    about: "Every character has a Unicode code point, a category and a byte representation in UTF-8 and UTF-16. Inspect any text character by character, and find hidden zero-width spaces, non-breaking spaces and direction marks that often break code, passwords, spreadsheets and form validation.",
    faq: [
      ["What is a zero-width space?", "U+200B is an invisible character that takes no space. It often sneaks in when text is copied from websites or chat apps."],
      ["Why do some characters use more than one byte?", "UTF-8 uses 1 byte for basic English letters, 2–3 bytes for most other scripts including Hindi, and 4 bytes for emoji."],
      ["Why does one emoji count as several characters?", "Many emoji are sequences of several code points joined together, such as skin tone and family emoji."],
    ],
  },
  "text-to-binary": {
    about: "Computers store text as numbers. This converter turns text into its UTF-8 bytes written in binary, hexadecimal, octal or decimal, and converts those codes back into readable text. It is useful for computer-science homework, debugging encodings and puzzles. Hindi letters and emoji use multiple bytes and are fully supported.",
    faq: [
      ["What is 'A' in binary?", "The letter A is byte 65, which is 01000001 in binary and 41 in hexadecimal."],
      ["Why does a Hindi letter produce three bytes?", "UTF-8 encodes Devanagari characters with 3 bytes each."],
      ["Can I paste binary without spaces?", "Yes. A continuous binary string is split into 8-bit bytes automatically."],
    ],
  },
  "video-thumbnail-resizer": {
    about: "Video platforms recommend specific sizes for thumbnails, channel banners and profile images, and the wrong shape gets cropped awkwardly. Resize any image to standard sizes such as a 1280 × 720 thumbnail with smart framing that keeps the subject centred, then download a file ready to upload.",
    faq: [
      ["What size is a video thumbnail?", "1280 × 720 pixels (16:9) is the widely recommended size, with a minimum width of 640 pixels."],
      ["What is the file size limit for thumbnails?", "Many platforms limit thumbnails to about 2 MB. Use the Image Compressor if your file is larger."],
      ["Is this tool affiliated with any video platform?", "No. Toolsivo is independent; platform names are used only to describe the image sizes."],
    ],
  },
  "social-media-image-resizer": {
    about: "Each social network uses different shapes for posts, stories, covers and profile pictures. Pick a preset for Instagram, Facebook, X, LinkedIn or Pinterest, adjust the framing, and download an image at the exact pixel size so nothing important gets cropped.",
    faq: [
      ["What size is an Instagram post?", "A square post is 1080 × 1080 pixels, a portrait post is 1080 × 1350 and a story is 1080 × 1920."],
      ["Why does my image look blurry after upload?", "Uploading an image smaller than the recommended size makes the platform enlarge it. Start with a large photo."],
      ["Is Toolsivo connected to my social accounts?", "No. The tool only creates image files on your device; nothing is posted or uploaded."],
    ],
  },
  "favicon-generator": {
    about: "A favicon is the small icon shown in browser tabs, bookmarks and home screens. Create one from an image, text or emoji and download favicon.ico plus PNG sizes for browsers, Apple touch icons and Android, along with the HTML tags to add to your site.",
    faq: [
      ["What sizes does a favicon need?", "A multi-size favicon.ico (16, 32 and 48 px), a 180 × 180 Apple touch icon and 192 and 512 px icons for Android cover most uses."],
      ["Can Google show my favicon in search results?", "Yes. Google requires a square favicon at least 48 × 48 pixels linked from your home page."],
      ["Can I use any emoji as a favicon?", "Yes. The emoji is drawn with your device's emoji font, so its look depends on your operating system."],
    ],
  },
  "color-palette-generator": {
    about: "Choosing colours that work together is easier with colour harmony rules such as complementary, analogous and triadic. Generate palettes, lock the colours you like while shuffling the rest, or extract a palette from a photo. Copy HEX values or CSS variables for your designs.",
    faq: [
      ["What is a complementary colour scheme?", "It uses colours opposite each other on the colour wheel, such as blue and orange, for strong contrast."],
      ["How many colours should a palette have?", "Three to five colours is common: a primary, a secondary, an accent and neutrals for text and backgrounds."],
      ["Is my photo uploaded when extracting colours?", "No. Colours are read from the image in your browser."],
    ],
  },
  "image-watermark": {
    about: "A watermark shows who owns an image and discourages unauthorised reuse. Add text or a logo, set position, size, rotation and opacity, or tile it across the whole image, then download the watermarked copy.",
    faq: [
      ["Can a watermark be removed?", "A faint corner watermark is easy to crop. Tiled, semi-transparent watermarks across the image are much harder to remove."],
      ["Can I use a transparent PNG logo?", "Yes. Transparent areas of a PNG logo stay transparent on top of your image."],
      ["Should I watermark my only copy?", "No. The watermark is added to a new file; always keep your original without it."],
    ],
  },
  "transparent-png-previewer": {
    about: "It is hard to see whether a PNG really has a transparent background on a white page. Preview your image on checkerboard, light, dark and custom colour backgrounds, check how much of it is transparent, and trim empty transparent edges to create a tightly cropped file.",
    faq: [
      ["How can I tell if a PNG is transparent?", "Transparent areas show the checkerboard pattern behind the image."],
      ["Why does my logo have a white box on dark backgrounds?", "The image has a white background instead of transparency. It needs to be re-exported with a transparent background."],
      ["What does trimming do?", "It removes fully transparent rows and columns around the edges, so the image is cropped to its visible content."],
    ],
  },
  "qr-code-generator": {
    about: "QR codes let people open a link, join Wi-Fi, send an email or call a number by scanning with their phone camera. Create a QR code for a URL, Wi-Fi network, email, phone number or plain text, choose colours, and download PNG for sharing or SVG for sharp printing at any size. The codes are static and never expire.",
    faq: [
      ["Do these QR codes expire?", "No. The information is stored in the code itself, so it works as long as the link or details inside are valid."],
      ["How small can a printed QR code be?", "Around 2 × 2 cm is a practical minimum for close scanning. Make it larger for posters viewed from a distance."],
      ["Do custom colours affect scanning?", "Keep dark modules on a light background with strong contrast. Inverted or low-contrast colours may not scan."],
    ],
  },
  "color-picker-gradient": {
    about: "Pick any colour and convert it between HEX, RGB, HSL, HSV and CMYK, then build linear, radial or conic CSS gradients with multiple colour stops. Copy the CSS directly into your stylesheet. CMYK values are approximate conversions useful for planning print colours.",
    faq: [
      ["What is the difference between RGB and CMYK?", "RGB mixes light for screens. CMYK mixes inks for printing, so some bright screen colours cannot be printed exactly."],
      ["What is HSL?", "Hue, saturation and lightness — a way to describe colour that makes it easy to create lighter or darker shades."],
      ["Do CSS gradients work in all browsers?", "Linear, radial and conic gradients are supported by all modern browsers."],
    ],
  },
  "email-signature-generator": {
    about: "A professional email signature shares your name, role, contact details and links in a consistent way. Fill in your details, add a photo and choose a layout, then copy the formatted signature into Gmail, Outlook or Apple Mail. Your details are saved only in your own browser for next time.",
    faq: [
      ["How do I add the signature to Gmail?", "Copy the signature, open Gmail Settings → General → Signature, paste it and save."],
      ["Why doesn't my photo appear in sent emails?", "Some email apps block images or need them hosted online. Use a photo URL that is publicly accessible."],
      ["Where are my details stored?", "Only in your browser's local storage on this device. They are never sent to Toolsivo."],
    ],
  },
  "color-contrast-checker": {
    about: "Text that does not contrast enough with its background is hard to read, especially for people with low vision. Check the contrast ratio of any text and background colour pair against WCAG 2.2 AA and AAA levels for normal and large text, and get suggested colours that pass.",
    faq: [
      ["What contrast ratio is required?", "WCAG AA requires 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 and 4.5:1."],
      ["What counts as large text?", "At least 18 point (24 px) regular, or 14 point (about 18.66 px) bold."],
      ["Why does contrast matter for websites?", "Good contrast makes text readable for everyone, including in bright sunlight, and is part of accessibility laws in many countries."],
    ],
  },
  "poster-maker": {
    about: "Make posters, flyers and notices for events, shops, classes and announcements without design software. Start from an original template, edit the headings, details and colours, add your own photo, and download a print-ready PNG or PDF in standard paper sizes.",
    faq: [
      ["What size should I print my poster?", "A4 suits notice boards and handouts; A3 is better for walls and shop windows."],
      ["Can I use any photo on my poster?", "Use photos you took yourself or have permission to use. You are responsible for the rights to the images and text you add."],
      ["Do the templates have copyright restrictions?", "The templates were created for Toolsivo, and the posters you make are yours to use."],
    ],
  },
  "video-aspect-ratio-calculator": {
    about: "Aspect ratio is the proportion of width to height, such as 16:9 for widescreen video or 9:16 for vertical shorts and reels. Calculate the ratio of any dimensions, find the missing width or height when resizing, and read the exact dimensions and ratio of a video file directly from your device.",
    faq: [
      ["What resolution is 1080p?", "1920 × 1080 pixels, which is 16:9."],
      ["What aspect ratio do vertical videos use?", "9:16, for example 1080 × 1920 pixels."],
      ["Is my video uploaded to read its size?", "No. Your browser reads the dimensions locally."],
    ],
  },
  "audio-metadata-viewer": {
    about: "Audio files carry hidden tags with the title, artist, album, year, genre and often cover art, plus technical details such as bitrate, sample rate and duration. Open MP3, FLAC, M4A, WAV or OGG files to view every tag and download the embedded cover image. Files are read on your device.",
    faq: [
      ["What is a good bitrate for MP3?", "128 kbps is acceptable for speech, while 256–320 kbps sounds close to CD quality for music."],
      ["What is the difference between lossy and lossless audio?", "Lossy formats like MP3 discard some sound to save space. Lossless formats like FLAC and WAV keep everything."],
      ["Can I edit tags with this tool?", "It is a viewer. Use a tag editor if you need to change the metadata."],
    ],
  },
  "gif-frame-extractor": {
    about: "An animated GIF is a sequence of still frames, each shown for a set time. Extract every frame as a PNG image, see each frame's delay, and download them all in a ZIP or combined into a sprite sheet for games and CSS animations.",
    faq: [
      ["Why do some frames look incomplete?", "GIFs often store only the changed part of each frame. The tool composites frames so each PNG shows the full picture."],
      ["What is a sprite sheet?", "A single image that contains all frames in a grid, often used for game and web animations."],
      ["Is the GIF uploaded?", "No. Frames are decoded in your browser."],
    ],
  },
  "subtitle-converter": {
    about: "Different video players and platforms expect different subtitle formats. Convert between SRT, WebVTT, SBV, ASS and plain text, and shift every timestamp forward or back to fix subtitles that appear too early or too late.",
    faq: [
      ["What is the difference between SRT and VTT?", "Both are timed text formats. SRT uses commas in times and is the most widely supported; WebVTT is the web standard used by HTML5 video."],
      ["How do I fix out-of-sync subtitles?", "Find how many seconds early or late the subtitles are, then shift all timings by that amount."],
      ["Is styling from ASS files kept?", "Basic text is converted. Advanced ASS styling such as fonts and positions cannot be represented in SRT or plain text."],
    ],
  },
};

export default content;
