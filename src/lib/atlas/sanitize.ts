import sanitizeHtml from "sanitize-html";

/**
 * Очистка HTML-описаний товаров/категорий и CustomHtml-секций.
 * Разрешены: p, h3, h4, ul, ol, li, strong, em, table, thead, tbody, tr, th, td, br, a, span, div, img, figure, figcaption, blockquote.
 */
const ALLOWED_TAGS = [
  "p", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "em", "br",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "span", "div", "img", "figure", "figcaption", "blockquote",
];

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height", "loading"],
  span: ["class"],
  div: ["class"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
  figure: ["class"],
  figcaption: ["class"],
};

export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });
}

/** Очистка произвольного HTML (CustomHtml секция) — строже по ссылкам, но с тем же набором тегов */
export function sanitizeCustomHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...ALLOWED_TAGS, "h1", "h2", "hr", "video", "source"],
    allowedAttributes: {
      ...ALLOWED_ATTR,
      video: ["src", "controls", "width", "height"],
      source: ["src", "type"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"], video: ["http", "https"] },
  });
}

/** Проверка: нет ли символов U+FFFD (битый UTF-8) */
export function hasReplacementChars(text: string): boolean {
  return text.includes("\uFFFD");
}
