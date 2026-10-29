// Unique explanatory text and FAQs for the Office, Privacy Utilities and Typing tool pages.
const content = {
  "invoice-generator": {
    about: "Freelancers, shop owners and small businesses need clear invoices to get paid on time. Add your business and customer details, logo, line items, discounts and GST, and the totals, tax split and amount in words are calculated for you. Save the invoice as a PDF or print it. Your business details are remembered in your own browser for the next invoice.",
    faq: [
      ["What must a GST invoice include?", "Key details include the supplier's name, address and GSTIN, invoice number and date, customer details, HSN/SAC codes, taxable value, GST rate and amount, and place of supply. Check current GST rules for your business."],
      ["Can I make an invoice without GST?", "Yes. If you are not registered under GST, leave the GSTIN empty and set the tax to 0%. Do not charge GST unless you are registered."],
      ["Are my invoices stored online?", "No. Details are kept only in your browser's local storage on this device and the PDF is created locally."],
    ],
  },
  "quotation-generator": {
    about: "A quotation tells a customer what you will supply and at what price before they commit. Create quotations and estimates with line items, taxes, discounts, a validity date and your terms, then save a professional PDF to send. When the customer agrees, use the Invoice Generator to bill them.",
    faq: [
      ["What is the difference between a quotation and an invoice?", "A quotation is an offer before work starts. An invoice is a request for payment after goods or services are supplied."],
      ["How long should a quotation be valid?", "Commonly 15 to 30 days, because prices for materials and services can change."],
      ["Is a quotation legally binding?", "Once the customer accepts it, it can form part of a contract. Make your terms clear and seek legal advice for large contracts."],
    ],
  },
  "meeting-agenda-builder": {
    about: "A clear agenda keeps meetings short and focused. List the topics, give each a duration and an owner, and the start time of every item is calculated automatically. Add attendees and notes, then print or save the agenda as a PDF to share before the meeting.",
    faq: [
      ["How long should each agenda item be?", "Give each item a realistic time and keep most meetings under an hour. Put the most important decisions first."],
      ["Why assign an owner to each item?", "An owner prepares the topic and leads the discussion, so the meeting moves faster."],
      ["Is my agenda saved?", "It is kept in your browser's local storage on this device only."],
    ],
  },
  "label-maker": {
    about: "Print address labels, product stickers and file labels on standard A4 label sheets with layouts such as 21, 24 and 65 labels per sheet. Repeat one design on every label or paste a list of addresses to print a different one on each. Print at 100% scale so the labels line up with your sheet.",
    faq: [
      ["Why don't my labels line up with the sheet?", "Make sure the print scale is 100% (not 'fit to page'), margins are set to none or default, and the selected layout matches your label sheet."],
      ["Can I print a list of different addresses?", "Yes. Paste one address per block and each label gets the next address."],
      ["Which paper should I use?", "Use self-adhesive A4 label sheets with the same number of labels as the layout you choose."],
    ],
  },
  "resume-builder": {
    about: "Recruiters and applicant tracking systems (ATS) scan résumés quickly, so a clean structure matters. Fill in your experience, education, skills and projects, choose an original layout and save a PDF with real, selectable text that ATS software can read. Your content stays in your browser and is never uploaded.",
    faq: [
      ["What is an ATS-friendly résumé?", "One with clear headings, standard section names, selectable text and no important information hidden in images or complex tables."],
      ["How long should a résumé be?", "One page for freshers and early-career roles, and up to two pages for experienced professionals."],
      ["Should I add a photo?", "In India and many countries a photo is optional. Some international employers prefer résumés without photos to reduce bias."],
    ],
  },
  "file-checksum-calculator": {
    about: "A checksum is a fingerprint of a file. If even one byte changes, the hash changes completely. Calculate SHA-256, SHA-1, SHA-384 and SHA-512 hashes of any file and compare them with the value published by the software maker to confirm your download is complete and has not been tampered with. Hashing uses your browser's Web Crypto API.",
    faq: [
      ["Which hash should I use?", "SHA-256 is the most common choice for verifying downloads. SHA-1 is only for checking older published hashes."],
      ["Why is MD5 not included?", "MD5 is broken for security purposes, so it is not offered."],
      ["Is my file uploaded to calculate the hash?", "No. The file is read and hashed on your device."],
    ],
  },
  "file-metadata-viewer": {
    about: "Photos and documents can carry hidden metadata such as the camera model, the date taken, editing software and even the exact GPS location where a picture was shot. View this information for images, PDFs and other files, and remove metadata from photos before sharing them online to protect your privacy.",
    faq: [
      ["Can a photo reveal where I live?", "Yes. Phone photos often include GPS coordinates. Remove the metadata before sharing pictures taken at home."],
      ["Do social networks remove metadata?", "Many large platforms strip it, but email, messaging apps sending files as documents, and many websites do not."],
      ["Does removing metadata change the photo?", "The image is saved again without the hidden data. The picture looks the same."],
    ],
  },
  "qr-code-reader": {
    about: "Decode a QR code from an image, a screenshot or your device camera without installing an app. The content is decoded on your device, and links are shown with a safety check so you can see where a QR code leads before opening it. This helps protect against 'quishing' — QR codes that point to fake payment or login pages.",
    faq: [
      ["Can I scan a QR code from a screenshot?", "Yes. Upload or paste the screenshot and the code is read from the image."],
      ["Is the camera video recorded?", "No. Frames are analysed on your device only to find a QR code and are never saved or uploaded."],
      ["How do I spot a dangerous QR code?", "Check the full link before opening it, be careful with shortened links, and never enter UPI PINs or passwords on pages opened from unknown QR codes."],
    ],
  },
  "text-to-speech": {
    about: "Listen to articles, notes and study material read aloud using the voices built into your device and browser. Choose a voice and language, adjust speed and pitch, and pause or resume at any time. Many devices include Indian English and Hindi voices. On-device voices work offline; if you choose a voice marked as online, the browser maker's service processes the text.",
    faq: [
      ["Why are different voices shown on different devices?", "Voices come from your operating system and browser, so Windows, Android, macOS and iOS each offer their own set."],
      ["Can I download the audio as MP3?", "Browsers do not provide the spoken audio as a file, so the tool plays speech but cannot save it."],
      ["Does it read Hindi?", "Yes, if your device has a Hindi voice installed. Select it from the voice list."],
    ],
  },
  "csv-viewer": {
    about: "CSV files exported from banks, shops and databases can be too large or awkward to open in a spreadsheet. Open a CSV in a fast table where you can search, sort columns and scroll through thousands of rows, then export the filtered result. The file is read in your browser and never uploaded.",
    faq: [
      ["Why does my CSV show strange characters?", "The file may use an encoding other than UTF-8, or a different delimiter such as a semicolon. Check the delimiter and save the file as UTF-8 if needed."],
      ["Can it open very large files?", "Files with hundreds of thousands of rows work on most computers; the limit depends on your device's memory."],
      ["Are bank statements safe to open here?", "Yes. The file stays on your device and is not sent anywhere."],
    ],
  },
  "english-to-hindi-typing": {
    about: "Type Hindi without a Hindi keyboard by writing words the way they sound in English letters. 'namaste' becomes नमस्ते and 'bharat' becomes भारत as you type. Copy the Devanagari text into WhatsApp, email, Word, social media or any form. Conversion happens on your device with no sign-up.",
    faq: [
      ["How do I type special Hindi letters?", "Use common spellings: 'aa' for आ, 'ee' for ई, 'sh' for श, and capital letters for retroflex sounds such as 'T' for ट and 'D' for ड."],
      ["Is this the same as Google Input Tools?", "No. Toolsivo is independent and uses its own phonetic conversion rules that run in your browser."],
      ["Can I paste the Hindi text into Microsoft Word?", "Yes. The output is standard Unicode Devanagari, which works in Word, Google Docs and all modern apps."],
    ],
  },
  "hindi-to-english-typing": {
    about: "Convert Hindi written in Devanagari into English letters so that people who cannot read Hindi script can still read it aloud. Choose everyday Hinglish spelling, as used in chats and song lyrics, or academic IAST with diacritics for research and Sanskrit-related work.",
    faq: [
      ["Is this a translation?", "No. Transliteration changes the script, not the language. 'आप कैसे हैं' becomes 'aap kaise hain', not 'How are you'."],
      ["What is IAST?", "The International Alphabet of Sanskrit Transliteration uses marks such as ā and ṭ to represent each Devanagari sound precisely."],
      ["Can I convert Marathi or Sanskrit text?", "Text in Devanagari script is converted, though spelling conventions are tuned for Hindi."],
    ],
  },
  "english-typing-test": {
    about: "Measure your English typing speed and accuracy with original practice passages and a 1, 3 or 5-minute timer. Results show gross and net words per minute (WPM), accuracy, errors and the words you mistyped. Many government typing tests in India, such as SSC and court clerk exams, ask for around 35 WPM in English.",
    faq: [
      ["How is WPM calculated?", "Every 5 characters, including spaces, count as one word. Net WPM subtracts a penalty for uncorrected errors."],
      ["What is a good typing speed?", "Around 40 WPM is average. 35 WPM with high accuracy meets many exam requirements, and 60+ WPM is fast."],
      ["How can I type faster?", "Learn touch typing on the home row, look at the screen rather than the keyboard, and focus on accuracy before speed."],
    ],
  },
  "hindi-typing-test": {
    about: "Practise Hindi typing for exams and office work with original Hindi passages and a 1, 3 or 5-minute timer. Type with a Hindi keyboard (InScript or your device's Hindi input) or in English letters that convert to Hindi. Mistyped words are highlighted and a full summary shows speed, accuracy and errors.",
    faq: [
      ["What Hindi typing speed is required for government jobs?", "Many exams ask for around 30 WPM in Hindi, but requirements vary — always check the official notification."],
      ["Does it support Krutidev or Remington layouts?", "The test accepts standard Unicode Hindi. You can use InScript or any Hindi input method on your device that produces Unicode text."],
      ["Can I practise without a Hindi keyboard?", "Yes. Choose the English letters (phonetic) option and type Hindi words as they sound."],
    ],
  },
  "typing-practice": {
    about: "Build typing skill step by step with words, sentences and paragraphs from beginner to advanced levels. Short practice rounds give instant feedback on speed and accuracy, and a daily challenge keeps you coming back. Regular short sessions improve muscle memory faster than occasional long ones.",
    faq: [
      ["How long should I practise each day?", "10–20 minutes of focused daily practice gives steady progress."],
      ["Should I focus on speed or accuracy?", "Accuracy first. Speed improves naturally once your fingers find the right keys without looking."],
      ["What is the home row?", "The middle row of letters. On a QWERTY keyboard your fingers rest on A, S, D, F and J, K, L, ;."],
    ],
  },
};

export default content;
