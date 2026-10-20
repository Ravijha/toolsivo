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
  "youtube-thumbnail-resizer": [CanvasResizer, { set: "youtube" }],
  "social-media-image-resizer": [CanvasResizer, { set: "social" }],
  "favicon-generator": [Favicon],
  "color-palette-generator": [Palette],
  "image-watermark": [Watermark],
  "transparent-png-previewer": [TransparentPreview],
};

export default function ToolRenderer({ slug }) {
  const entry = map[slug];
  if (!entry) return <p className="muted">This tool is coming soon.</p>;
  const [C, props = {}] = entry;
  return <C {...props} />;
}
