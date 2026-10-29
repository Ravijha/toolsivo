// Unique explanatory text and FAQs for the Developer and Website & SEO tool pages.
const content = {
  "json-formatter": {
    about: "JSON (JavaScript Object Notation) is the most common format for APIs and configuration files, but minified JSON is hard to read. Paste JSON to pretty-print it with consistent indentation, minify it for production, or validate it and jump to the exact line and column of any syntax error. Everything runs locally, so API responses containing private data stay on your machine.",
    faq: [
      ["What are the most common JSON errors?", "Trailing commas, single quotes instead of double quotes, unquoted keys and comments. Standard JSON allows none of these."],
      ["What is the difference between formatting and minifying?", "Formatting adds line breaks and indentation for readability. Minifying removes all unnecessary whitespace to make the file smaller."],
      ["Is my JSON sent to a server?", "No. Parsing and formatting happen in your browser."],
    ],
  },
  "base64-encoder-decoder": {
    about: "Base64 represents binary data using 64 plain text characters, so it can travel safely through email, JSON, HTML and URLs. Developers use it for data URLs, basic authentication headers and embedding small files. This tool encodes and decodes text with full UTF-8 support, including Hindi and emoji, and converts files to and from Base64 or data URLs.",
    faq: [
      ["Is Base64 encryption?", "No. Base64 is an encoding that anyone can reverse. Never use it to protect passwords or secrets."],
      ["Why is Base64 output larger than the input?", "Every 3 bytes become 4 characters, so encoded data is about 33% larger."],
      ["What is a data URL?", "A data URL embeds a file directly in a link, such as data:image/png;base64,…, so it can be used in HTML or CSS without a separate file."],
    ],
  },
  "url-encoder-decoder": {
    about: "URLs can only contain a limited set of characters, so spaces, symbols and non-English text must be percent-encoded — a space becomes %20, for example. Encode or decode individual query values or complete URLs, and break a URL into its parts to read each query parameter clearly. This is useful when debugging links, redirects and tracking parameters.",
    faq: [
      ["What is the difference between encoding a component and a full URL?", "Component encoding also escapes characters like /, ?, & and =, which is right for a single query value. Full URL encoding leaves those separators intact."],
      ["Why does + sometimes mean a space?", "In HTML form data, spaces are often sent as +. In other parts of a URL a space should be %20."],
      ["Can it decode Hindi or emoji in URLs?", "Yes. Percent-encoded UTF-8 sequences are decoded back to the original characters."],
    ],
  },
  "uuid-generator": {
    about: "A UUID (universally unique identifier) is a 128-bit value written as 36 characters, such as 3f2b8c1e-…, used as database keys, request IDs and file names. Version 4 UUIDs have 122 random bits, so the chance of two being the same is negligible. This generator uses your browser's cryptographically secure random number generator and can create thousands at once.",
    faq: [
      ["Are UUID v4 values truly unique?", "They are random rather than guaranteed unique, but with 122 random bits a collision is so unlikely that it can be ignored in practice."],
      ["What is the difference between a UUID and a GUID?", "GUID is Microsoft's name for the same 128-bit identifier format."],
      ["Are the UUIDs generated securely?", "Yes. They come from the Web Crypto API on your device and are never sent anywhere."],
    ],
  },
  "unix-timestamp-converter": {
    about: "A Unix timestamp counts the seconds since 1 January 1970 00:00:00 UTC, and is how many databases, logs and APIs store time. Convert a timestamp in seconds or milliseconds into a readable date in your local time and UTC, or turn a date back into a timestamp. A live clock shows the current timestamp as it ticks.",
    faq: [
      ["How do I know if a timestamp is in seconds or milliseconds?", "Current timestamps in seconds have 10 digits; in milliseconds they have 13 digits."],
      ["What is the year 2038 problem?", "Systems that store timestamps as signed 32-bit numbers overflow on 19 January 2038. Modern systems use 64-bit values."],
      ["Does a Unix timestamp depend on time zone?", "No. The timestamp is the same everywhere; only the displayed local date and time differ."],
    ],
  },
  "regex-tester": {
    about: "Regular expressions are patterns for finding and replacing text — for example validating email addresses, extracting numbers or cleaning data. Type a JavaScript regex, set flags such as g, i and m, and see every match and capture group highlighted live. Test replacement strings before using them in your code.",
    faq: [
      ["Which regex flavour does this use?", "It uses your browser's JavaScript regex engine, which matches the behaviour of Node.js and front-end code."],
      ["What do the g, i and m flags do?", "g finds all matches, i ignores letter case, and m makes ^ and $ match at the start and end of each line."],
      ["How do I refer to a capture group in a replacement?", "Use $1, $2 and so on, or $<name> for named groups."],
    ],
  },
  "code-minifier": {
    about: "Minification removes whitespace, comments and other characters that browsers don't need, which makes HTML, CSS and JavaScript files smaller and faster to download. JavaScript is minified with Terser, the same open-source minifier used by many build tools. Paste your code, copy the minified output and see how much size you saved.",
    faq: [
      ["Does minifying change how my code works?", "No. Minified code behaves the same; it is just harder for people to read. Keep your original source for editing."],
      ["Is minification the same as compression?", "No. Minification shrinks the source text. Servers can further compress it with gzip or Brotli."],
      ["Can minified code be reversed?", "Formatting can be restored, but removed comments and shortened variable names cannot be recovered."],
    ],
  },
  "password-generator": {
    about: "Strong passwords are long, random and unique for every account. Choose the length and which character types to include, and the generator creates passwords using your browser's cryptographically secure random number generator. You can also check how strong an existing password is. Nothing you generate or type is stored or sent anywhere.",
    faq: [
      ["How long should a password be?", "At least 12–16 characters for important accounts. Length adds more strength than complexity alone."],
      ["Is it safe to generate passwords online?", "This generator runs entirely on your device using the Web Crypto API, and passwords are never transmitted or saved."],
      ["How should I remember many strong passwords?", "Use a reputable password manager and turn on two-factor authentication wherever possible."],
    ],
  },
  "json-to-typescript": {
    about: "Writing TypeScript types for API responses by hand is slow and error-prone. Paste a JSON sample to generate interfaces or type aliases with nested objects, arrays and optional fields detected automatically. Rename the root type, then copy the code straight into your project.",
    faq: [
      ["How are optional fields detected?", "When an array contains objects where a key is missing in some items, that key is marked optional with ?."],
      ["Should I use interface or type?", "Both work for describing objects. Interfaces can be extended and merged; type aliases can also describe unions."],
      ["Is my JSON uploaded?", "No. Types are generated in your browser."],
    ],
  },
  "sql-formatter": {
    about: "Long SQL queries on a single line are hard to review. Format queries with consistent indentation, line breaks and keyword case for MySQL, PostgreSQL, SQL Server, SQLite, Oracle and other dialects. Formatting uses the open-source sql-formatter library and does not run or change the logic of your query.",
    faq: [
      ["Does formatting change what my query does?", "No. Only whitespace and keyword case change; the query logic stays the same."],
      ["Why choose a dialect?", "Each database has its own syntax for things like quoting, functions and parameters. Choosing the dialect helps the formatter parse them correctly."],
      ["Is my SQL sent to a database or server?", "No. The query is formatted locally in your browser and is never executed."],
    ],
  },
  "cron-expression-builder": {
    about: "Cron expressions schedule recurring jobs on servers and in CI pipelines with five fields: minute, hour, day of month, month and day of week. Build an expression by choosing options, read it back in plain English, and preview the next run times to be sure it fires when you expect.",
    faq: [
      ["What does * * * * * mean?", "It runs every minute. Each * means 'every' value for that field."],
      ["How do I run a job every day at 9:30 AM?", "Use 30 9 * * *. The first field is the minute and the second is the hour."],
      ["Which time zone do cron jobs use?", "Usually the server's time zone, often UTC. Check your scheduler's settings."],
    ],
  },
  "html-entity-encoder": {
    about: "Characters such as <, >, & and quotes have special meaning in HTML, so they must be written as entities like &lt; and &amp; to display correctly and to help prevent HTML injection. Encode text to named or numeric entities, or decode entity-filled text back to normal characters.",
    faq: [
      ["What is the difference between named and numeric entities?", "Named entities like &copy; are easier to read. Numeric entities like &#169; work for every Unicode character."],
      ["Do I need to encode Hindi or emoji?", "Not on UTF-8 pages. Only HTML-sensitive characters must be encoded, but numeric entities are available if you need pure ASCII."],
      ["Does encoding make my site secure?", "Encoding user input before inserting it into HTML is an important defence against XSS, but it should be part of a wider security approach."],
    ],
  },
  "markdown-table-generator": {
    about: "Markdown tables are used in README files, documentation and many note-taking apps, but aligning pipes and dashes by hand is tedious. Edit cells in a spreadsheet-style grid or paste CSV or Excel data, choose left, centre or right alignment for each column, and copy a neatly formatted Markdown table.",
    faq: [
      ["How do I paste data from Excel or Google Sheets?", "Copy the cells and paste them into the import box. Tab-separated and comma-separated data are both recognised."],
      ["How is column alignment written in Markdown?", "Colons in the separator row set alignment: :--- for left, :---: for centre and ---: for right."],
      ["Can a Markdown cell contain a pipe character?", "Yes, escape it as \\| so it is not treated as a column separator."],
    ],
  },
  "xml-formatter": {
    about: "XML is still widely used in sitemaps, RSS feeds, SOAP APIs, Android layouts and configuration files. Format messy XML with clean indentation, minify it, or validate it and see the exact line of any error. Comments and CDATA sections are preserved, and nothing leaves your browser.",
    faq: [
      ["What makes XML invalid?", "Common causes are unclosed tags, mismatched tag names, unescaped & characters and more than one root element."],
      ["Does formatting change the data?", "No. Only whitespace between elements changes. Text content, attributes, comments and CDATA are kept."],
      ["What is CDATA?", "A CDATA section holds text that should not be parsed as markup, such as code containing < and & characters."],
    ],
  },
  "jwt-decoder": {
    about: "A JSON Web Token (JWT) has three Base64URL parts — header, payload and signature — separated by dots. Decode a token to read its claims, see when it was issued and when it expires, and verify the signature with a shared secret (HS256/384/512) or public key (RS, PS and ES algorithms). Verification uses the Web Crypto API, so tokens never leave your device.",
    faq: [
      ["Is the JWT payload encrypted?", "No. Standard JWTs are only signed. Anyone with the token can read the payload, so never put secrets in it."],
      ["What do exp, iat and nbf mean?", "exp is the expiry time, iat is when the token was issued and nbf is the time before which it is not valid. All are Unix timestamps."],
      ["Is it safe to paste a production token here?", "Decoding and verification happen locally and nothing is sent anywhere, but treat live tokens like passwords and avoid sharing them."],
    ],
  },
  "uuid-validator": {
    about: "Check whether strings are valid UUIDs or GUIDs and learn what each one contains. The validator detects the version (1 to 8) and variant, and decodes the timestamp embedded in time-based UUIDs v1, v6 and v7. Paste one value or a whole list to validate them in bulk.",
    faq: [
      ["How can I tell a UUID's version?", "The first character of the third group shows the version. In xxxxxxxx-xxxx-4xxx-…, the 4 means version 4."],
      ["Which UUIDs contain a timestamp?", "Versions 1, 6 and 7. Version 7 is popular for database keys because it sorts by creation time."],
      ["Is a UUID with uppercase letters valid?", "Yes. UUIDs are case-insensitive, although lowercase is the recommended format."],
    ],
  },
  "css-box-shadow-generator": {
    about: "Box shadows add depth to cards, buttons and modals. Adjust offset, blur, spread, colour and opacity with live preview, stack several layers for realistic soft shadows, switch to inset shadows, or start from presets. Copy the ready-made CSS box-shadow declaration into your stylesheet.",
    faq: [
      ["What is the difference between blur and spread?", "Blur softens the shadow edge. Spread grows or shrinks the shadow before blurring."],
      ["Why use several shadow layers?", "Layering a tight dark shadow with a wide soft one looks more natural than a single shadow."],
      ["Do box shadows affect performance?", "Shadows are cheap on most elements, but very large blurs on many animated elements can slow down scrolling."],
    ],
  },
  "css-flexbox-playground": {
    about: "Flexbox is the CSS layout system for arranging items in a row or column, controlling alignment, spacing and wrapping. Change container properties such as flex-direction, justify-content, align-items and gap, adjust individual items with flex-grow, flex-shrink, order and align-self, and watch the layout update instantly before copying the CSS and HTML.",
    faq: [
      ["What is the difference between justify-content and align-items?", "justify-content aligns items along the main axis (horizontal in a row). align-items aligns them on the cross axis."],
      ["When should I use flexbox instead of grid?", "Flexbox suits one-dimensional layouts such as navbars and button rows. Grid is better for two-dimensional page layouts."],
      ["What does flex: 1 mean?", "It lets an item grow to fill available space equally with other flex: 1 items."],
    ],
  },
  "css-grid-generator": {
    about: "CSS Grid lays out content in rows and columns at the same time, which makes it ideal for page layouts and dashboards. Set the number and size of columns and rows, change the gap, and drag across cells to create named areas such as header, sidebar and footer. Copy clean grid-template CSS and matching HTML.",
    faq: [
      ["What does the fr unit mean?", "fr is a fraction of the free space. 1fr 2fr makes the second column twice as wide as the first."],
      ["What are grid-template-areas?", "Named areas let you describe a layout visually in CSS, then place elements with grid-area: header and so on."],
      ["Is CSS Grid supported in all browsers?", "Yes. All modern browsers fully support CSS Grid."],
    ],
  },
  "meta-tag-preview": {
    about: "Your page title and meta description are often the first thing people see in Google results. Search results cut off long titles and descriptions based on pixel width, not characters. Type your title, description and URL to preview the search snippet on desktop and mobile and adjust the wording until nothing important gets cut off.",
    faq: [
      ["How long should a meta title be?", "Roughly 50–60 characters, or about 580 pixels on desktop. Put the most important words first."],
      ["How long should a meta description be?", "About 120–160 characters. Google may show a different snippet if it finds text on the page more relevant to the search."],
      ["Do meta descriptions affect rankings?", "Not directly, but a clear description can improve click-through rate from search results."],
    ],
  },
  "open-graph-preview": {
    about: "Open Graph tags control the title, description and image shown when a link is shared on social networks and messaging apps. Enter your page details and image to preview link cards in common styles, then copy the og: and twitter: meta tags to paste into your page's <head>.",
    faq: [
      ["What size should an Open Graph image be?", "1200 × 630 pixels (1.91:1) works well on most platforms."],
      ["Why does my old preview still show after I change the tags?", "Platforms cache link previews. Use their sharing debugger tools to refresh the cached version."],
      ["Do I need Twitter tags if I have Open Graph tags?", "X falls back to Open Graph tags, but adding twitter:card lets you choose the large image layout."],
    ],
  },
  "robots-txt-generator": {
    about: "robots.txt is a plain text file at the root of your website that tells search-engine crawlers which paths they may crawl. Create rules for all bots or specific ones, add your sitemap URL, and optionally block AI training crawlers. Download the file and upload it to your site's root folder.",
    faq: [
      ["Does Disallow remove a page from Google?", "No. It stops crawling, but a blocked URL can still appear in results if other sites link to it. Use a noindex tag to keep a page out of search."],
      ["Where should robots.txt be placed?", "At the root of your domain, for example https://example.com/robots.txt."],
      ["Do all crawlers obey robots.txt?", "Reputable search engines do, but it is a request, not a security measure. Never rely on it to hide private content."],
    ],
  },
  "xml-sitemap-generator": {
    about: "An XML sitemap lists the pages on your site so search engines can discover them faster. Paste your URLs to generate a valid sitemap with optional last-modified dates, change frequency and priority. Upload the file to your site and submit it in Google Search Console.",
    faq: [
      ["How many URLs can a sitemap contain?", "Up to 50,000 URLs and 50 MB uncompressed. Larger sites should split URLs into several sitemaps with a sitemap index."],
      ["Does Google use priority and changefreq?", "Google says it ignores them. An accurate lastmod date is the most useful optional field."],
      ["Where do I submit my sitemap?", "In Google Search Console under Sitemaps, and add a Sitemap: line to your robots.txt."],
    ],
  },
  "http-status-checker": {
    about: "Broken links and redirects hurt user experience and SEO. Paste a list of URLs to check whether each one is reachable, read its HTTP status code and response time, and get a quick SEO review of the URL itself. Requests are made directly from your browser, so the sites you check see a normal visit from you; some servers block such checks with CORS, which the tool reports.",
    faq: [
      ["What do 200, 301, 404 and 500 mean?", "200 is OK, 301 is a permanent redirect, 404 means the page was not found and 500 is a server error."],
      ["Why do some URLs show a CORS limitation?", "Browsers only reveal the full response when a site allows it. The tool can still tell whether the server responded."],
      ["Should I use 301 or 302 redirects?", "Use 301 for permanent moves so search engines transfer ranking signals. Use 302 only for temporary changes."],
    ],
  },
};

export default content;
