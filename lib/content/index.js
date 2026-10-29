import imagePdf from "./image-pdf";
import calculators from "./calculators";
import developerSeo from "./developer-seo";
import textDesignMedia from "./text-design-media";
import officeUtilitiesTyping from "./office-utilities-typing";

// Per-tool "About" text and FAQs shown on each /tools/[slug] page: { about, faq: [[question, answer], …] }
const content = { ...imagePdf, ...calculators, ...developerSeo, ...textDesignMedia, ...officeUtilitiesTyping };

export const getToolContent = (slug) => content[slug];
