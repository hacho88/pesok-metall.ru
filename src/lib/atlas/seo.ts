import type { Metadata } from "next";
import type { AtlasProduct, AtlasCategoryNode } from "./catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pesok-metall.ru";
const SITE_NAME = "pesok-metall.ru";

export function productMetadata(product: AtlasProduct): Metadata {
  const title = product.seoTitle || `${product.name} — купить в Москве и МО | ${SITE_NAME}`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `${product.name} — доставка в день заказа по Москве и Московской области. ГОСТ, сертификаты.`;
  const image = product.imageLocal || product.imageUrl || undefined;
  const url = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    keywords: product.keywords.length > 0 ? product.keywords : undefined,
  };
}

export function categoryMetadata(node: AtlasCategoryNode, description?: string | null): Metadata {
  const title = `${node.name} — купить, цены | ${SITE_NAME}`;
  const desc = description || `${node.name} — ${node.totalProductCount} товаров в каталоге. Доставка по Москве и МО в день заказа.`;
  const url = `${SITE_URL}/catalog/${encodeURIComponent(node.slug)}`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export function searchMetadata(query: string): Metadata {
  const title = `Поиск: ${query} — ${SITE_NAME}`;
  const url = `${SITE_URL}/search?q=${encodeURIComponent(query)}`;
  return {
    title,
    description: `Результаты поиска по запросу «${query}» в каталоге металлопроката и сыпучих материалов.`,
    alternates: { canonical: url },
  };
}

/** JSON-LD для товара */
export function productJsonLd(product: AtlasProduct, price: number | null): Record<string, unknown> {
  const image = product.imageLocal || product.imageUrl;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.slug,
    category: product.categoryName,
    description: product.shortDescription || product.name,
    image: image ? [image] : undefined,
    offers: price != null
      ? {
          "@type": "Offer",
          price: price.toFixed(2),
          priceCurrency: "RUB",
          availability: product.isOnOrder
            ? "https://schema.org/PreOrder"
            : "https://schema.org/InStock",
          url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
        }
      : undefined,
  };
}

/** JSON-LD для хлебных крошек */
export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/** JSON-LD для организации */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: "+7 (495) 000-00-00",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      addressRegion: "Московская область",
      addressCountry: "RU",
    },
  };
}
