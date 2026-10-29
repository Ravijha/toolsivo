"use client";
import dynamic from "next/dynamic";
import { Spinner } from "./ui";

const loading = () => (
  <div style={{ display: "grid", placeItems: "center", minHeight: 260 }}>
    <Spinner dark />
  </div>
);

const CropResize = dynamic(() => import("@/tools/CropResize"), { ssr: false, loading });
const FormatConverter = dynamic(() => import("@/tools/FormatConverter"), { ssr: false, loading });
const Compressor = dynamic(() => import("@/tools/Compressor"), { ssr: false, loading });
const Passport = dynamic(() => import("@/tools/Passport"), { ssr: false, loading });
const RotateFlip = dynamic(() => import("@/tools/RotateFlip"), { ssr: false, loading });
const MergePdf = dynamic(() => import("@/tools/MergePdf"), { ssr: false, loading });
const SplitPdf = dynamic(() => import("@/tools/SplitPdf"), { ssr: false, loading });
const RotatePdf = dynamic(() => import("@/tools/RotatePdf"), { ssr: false, loading });
const ExtractPdf = dynamic(() => import("@/tools/ExtractPdf"), { ssr: false, loading });
const ImagesToPdf = dynamic(() => import("@/tools/ImagesToPdf"), { ssr: false, loading });
const CompressPdf = dynamic(() => import("@/tools/CompressPdf"), { ssr: false, loading });
const Percentage = dynamic(() => import("@/tools/Percentage"), { ssr: false, loading });
const Gst = dynamic(() => import("@/tools/Gst"), { ssr: false, loading });
const Emi = dynamic(() => import("@/tools/Emi"), { ssr: false, loading });
const Age = dynamic(() => import("@/tools/Age"), { ssr: false, loading });
const Salary = dynamic(() => import("@/tools/Salary"), { ssr: false, loading });
const Discount = dynamic(() => import("@/tools/Discount"), { ssr: false, loading });
const DateDiff = dynamic(() => import("@/tools/DateDiff"), { ssr: false, loading });
const Json = dynamic(() => import("@/tools/Json"), { ssr: false, loading });
const Base64 = dynamic(() => import("@/tools/Base64"), { ssr: false, loading });
const UrlCodec = dynamic(() => import("@/tools/UrlCodec"), { ssr: false, loading });
const Uuid = dynamic(() => import("@/tools/Uuid"), { ssr: false, loading });
const Timestamp = dynamic(() => import("@/tools/Timestamp"), { ssr: false, loading });
const Regex = dynamic(() => import("@/tools/Regex"), { ssr: false, loading });
const Minifier = dynamic(() => import("@/tools/Minifier"), { ssr: false, loading });
const WordCounter = dynamic(() => import("@/tools/WordCounter"), { ssr: false, loading });
const Dedupe = dynamic(() => import("@/tools/Dedupe"), { ssr: false, loading });
const CaseConverter = dynamic(() => import("@/tools/CaseConverter"), { ssr: false, loading });
const LineBreak = dynamic(() => import("@/tools/LineBreak"), { ssr: false, loading });
const TextCompare = dynamic(() => import("@/tools/TextCompare"), { ssr: false, loading });
const Slug = dynamic(() => import("@/tools/Slug"), { ssr: false, loading });
const Lorem = dynamic(() => import("@/tools/Lorem"), { ssr: false, loading });
const CanvasResizer = dynamic(() => import("@/tools/CanvasResizer"), { ssr: false, loading });
const Favicon = dynamic(() => import("@/tools/Favicon"), { ssr: false, loading });
const Palette = dynamic(() => import("@/tools/Palette"), { ssr: false, loading });
const Watermark = dynamic(() => import("@/tools/Watermark"), { ssr: false, loading });
const TransparentPreview = dynamic(() => import("@/tools/TransparentPreview"), { ssr: false, loading });
const Ocr = dynamic(() => import("@/tools/Ocr"), { ssr: false, loading });
const QrCode = dynamic(() => import("@/tools/QrCode"), { ssr: false, loading });
const Password = dynamic(() => import("@/tools/Password"), { ssr: false, loading });
const ColorGradient = dynamic(() => import("@/tools/ColorGradient"), { ssr: false, loading });
const MetaPreview = dynamic(() => import("@/tools/MetaPreview"), { ssr: false, loading });
const OgPreview = dynamic(() => import("@/tools/OgPreview"), { ssr: false, loading });
const RobotsTxt = dynamic(() => import("@/tools/RobotsTxt"), { ssr: false, loading });
const SitemapGen = dynamic(() => import("@/tools/SitemapGen"), { ssr: false, loading });
const HttpStatus = dynamic(() => import("@/tools/HttpStatus"), { ssr: false, loading });
const AspectRatio = dynamic(() => import("@/tools/AspectRatio"), { ssr: false, loading });
const AudioMeta = dynamic(() => import("@/tools/AudioMeta"), { ssr: false, loading });
const GifFrames = dynamic(() => import("@/tools/GifFrames"), { ssr: false, loading });
const Subtitles = dynamic(() => import("@/tools/Subtitles"), { ssr: false, loading });
const TimeDuration = dynamic(() => import("@/tools/TimeDuration"), { ssr: false, loading });
const WorkingDays = dynamic(() => import("@/tools/WorkingDays"), { ssr: false, loading });
const TimeZone = dynamic(() => import("@/tools/TimeZone"), { ssr: false, loading });
const LoanPrepay = dynamic(() => import("@/tools/LoanPrepay"), { ssr: false, loading });
const Recipe = dynamic(() => import("@/tools/Recipe"), { ssr: false, loading });
const FuelCost = dynamic(() => import("@/tools/FuelCost"), { ssr: false, loading });
const SplitBill = dynamic(() => import("@/tools/SplitBill"), { ssr: false, loading });
const JsonToTs = dynamic(() => import("@/tools/JsonToTs"), { ssr: false, loading });
const SqlFormat = dynamic(() => import("@/tools/SqlFormat"), { ssr: false, loading });
const Cron = dynamic(() => import("@/tools/Cron"), { ssr: false, loading });
const HtmlEntity = dynamic(() => import("@/tools/HtmlEntity"), { ssr: false, loading });
const MarkdownTable = dynamic(() => import("@/tools/MarkdownTable"), { ssr: false, loading });
const EmailSignature = dynamic(() => import("@/tools/EmailSignature"), { ssr: false, loading });
const ContrastChecker = dynamic(() => import("@/tools/ContrastChecker"), { ssr: false, loading });
const Poster = dynamic(() => import("@/tools/Poster"), { ssr: false, loading });
const Agenda = dynamic(() => import("@/tools/Agenda"), { ssr: false, loading });
const Labels = dynamic(() => import("@/tools/Labels"), { ssr: false, loading });
const Resume = dynamic(() => import("@/tools/Resume"), { ssr: false, loading });
const Checksum = dynamic(() => import("@/tools/Checksum"), { ssr: false, loading });
const FileMeta = dynamic(() => import("@/tools/FileMeta"), { ssr: false, loading });
const QrReader = dynamic(() => import("@/tools/QrReader"), { ssr: false, loading });
const Tts = dynamic(() => import("@/tools/Tts"), { ssr: false, loading });
const CsvViewer = dynamic(() => import("@/tools/CsvViewer"), { ssr: false, loading });
const InvoiceQuote = dynamic(() => import("@/tools/InvoiceQuote"), { ssr: false, loading });
const HindiTyping = dynamic(() => import("@/tools/HindiTyping"), { ssr: false, loading });
const HindiToEnglish = dynamic(() => import("@/tools/HindiToEnglish"), { ssr: false, loading });
const TypingTest = dynamic(() => import("@/tools/TypingTest"), { ssr: false, loading });
const TypingPractice = dynamic(() => import("@/tools/TypingPractice"), { ssr: false, loading });
const Calculator = dynamic(() => import("@/tools/Calculator"), { ssr: false, loading });
const CaseAnalyzer = dynamic(() => import("@/tools/CaseAnalyzer"), { ssr: false, loading });
const CharFrequency = dynamic(() => import("@/tools/CharFrequency"), { ssr: false, loading });
const UnicodeInspector = dynamic(() => import("@/tools/UnicodeInspector"), { ssr: false, loading });
const TextBinary = dynamic(() => import("@/tools/TextBinary"), { ssr: false, loading });
const XmlFormat = dynamic(() => import("@/tools/XmlFormat"), { ssr: false, loading });
const JwtDecoder = dynamic(() => import("@/tools/JwtDecoder"), { ssr: false, loading });
const UuidValidator = dynamic(() => import("@/tools/UuidValidator"), { ssr: false, loading });
const BoxShadow = dynamic(() => import("@/tools/BoxShadow"), { ssr: false, loading });
const Flexbox = dynamic(() => import("@/tools/Flexbox"), { ssr: false, loading });
const CssGrid = dynamic(() => import("@/tools/CssGrid"), { ssr: false, loading });
const DpiCalculator = dynamic(() => import("@/tools/DpiCalculator"), { ssr: false, loading });
const UnitConverter = dynamic(() => import("@/tools/UnitConverter"), { ssr: false, loading });

const map = {
  "image-cropper-resizer": [CropResize],
  "jpg-to-png": [FormatConverter, { to: "image/png", accept: "image/jpeg,.jpg,.jpeg", from: "JPG" }],
  "png-to-jpg": [FormatConverter, { to: "image/jpeg", accept: "image/png,.png", from: "PNG" }],
  "image-to-webp": [FormatConverter, { to: "image/webp", accept: "image/*", from: "image" }],
  "image-compressor": [Compressor],
  "passport-photo-maker": [Passport],
  "rotate-flip-image": [RotateFlip],
  "merge-pdf": [MergePdf],
  "split-pdf": [SplitPdf],
  "rotate-pdf": [RotatePdf],
  "extract-pdf-pages": [ExtractPdf],
  "images-to-pdf": [ImagesToPdf],
  "compress-pdf": [CompressPdf],
  "percentage-calculator": [Percentage],
  "gst-calculator": [Gst],
  "emi-calculator": [Emi],
  "age-calculator": [Age],
  "salary-calculator": [Salary],
  "discount-calculator": [Discount],
  "date-difference-calculator": [DateDiff],
  "json-formatter": [Json],
  "base64-encoder-decoder": [Base64],
  "url-encoder-decoder": [UrlCodec],
  "uuid-generator": [Uuid],
  "unix-timestamp-converter": [Timestamp],
  "regex-tester": [Regex],
  "code-minifier": [Minifier],
  "word-counter": [WordCounter],
  "remove-duplicate-lines": [Dedupe],
  "case-converter": [CaseConverter],
  "line-break-remover": [LineBreak],
  "text-compare": [TextCompare],
  "slug-generator": [Slug],
  "lorem-ipsum-generator": [Lorem],
  "video-thumbnail-resizer": [CanvasResizer, { set: "youtube" }],
  "social-media-image-resizer": [CanvasResizer, { set: "social" }],
  "favicon-generator": [Favicon],
  "color-palette-generator": [Palette],
  "image-watermark": [Watermark],
  "transparent-png-previewer": [TransparentPreview],
  "image-to-text": [Ocr],
  "qr-code-generator": [QrCode],
  "password-generator": [Password],
  "color-picker-gradient": [ColorGradient],
  "meta-tag-preview": [MetaPreview],
  "open-graph-preview": [OgPreview],
  "robots-txt-generator": [RobotsTxt],
  "xml-sitemap-generator": [SitemapGen],
  "http-status-checker": [HttpStatus],
  "video-aspect-ratio-calculator": [AspectRatio],
  "audio-metadata-viewer": [AudioMeta],
  "gif-frame-extractor": [GifFrames],
  "subtitle-converter": [Subtitles],
  "time-duration-calculator": [TimeDuration],
  "working-days-calculator": [WorkingDays],
  "time-zone-converter": [TimeZone],
  "loan-prepayment-calculator": [LoanPrepay],
  "recipe-quantity-calculator": [Recipe],
  "fuel-cost-calculator": [FuelCost],
  "split-bill-calculator": [SplitBill],
  "json-to-typescript": [JsonToTs],
  "sql-formatter": [SqlFormat],
  "cron-expression-builder": [Cron],
  "html-entity-encoder": [HtmlEntity],
  "markdown-table-generator": [MarkdownTable],
  "email-signature-generator": [EmailSignature],
  "color-contrast-checker": [ContrastChecker],
  "poster-maker": [Poster],
  "meeting-agenda-builder": [Agenda],
  "label-maker": [Labels],
  "resume-builder": [Resume],
  "file-checksum-calculator": [Checksum],
  "file-metadata-viewer": [FileMeta],
  "qr-code-reader": [QrReader],
  "text-to-speech": [Tts],
  "csv-viewer": [CsvViewer],
  "online-calculator": [Calculator],
  "english-to-hindi-typing": [HindiTyping],
  "hindi-to-english-typing": [HindiToEnglish],
  "english-typing-test": [TypingTest, { lang: "en" }],
  "hindi-typing-test": [TypingTest, { lang: "hi" }],
  "typing-practice": [TypingPractice],
  "case-sensitive-text-analyzer": [CaseAnalyzer],
  "character-frequency-counter": [CharFrequency],
  "unicode-character-inspector": [UnicodeInspector],
  "text-to-binary": [TextBinary],
  "xml-formatter": [XmlFormat],
  "jwt-decoder": [JwtDecoder],
  "uuid-validator": [UuidValidator],
  "css-box-shadow-generator": [BoxShadow],
  "css-flexbox-playground": [Flexbox],
  "css-grid-generator": [CssGrid],
  "image-dpi-calculator": [DpiCalculator],
  "unit-converter": [UnitConverter],
  "invoice-generator": [InvoiceQuote, { kind: "invoice" }],
  "quotation-generator": [InvoiceQuote, { kind: "quotation" }],
};

export default function ToolRenderer({ slug }) {
  const entry = map[slug];
  if (!entry) return <p className="muted">This tool is coming soon.</p>;
  const [C, props = {}] = entry;
  return <C {...props} />;
}
