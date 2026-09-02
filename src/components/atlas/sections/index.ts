import type { ComponentType } from "react";
import type { z } from "zod";

export interface SectionComponentProps {
  props: Record<string, unknown>;
  data: unknown;
}

export interface SectionEntry {
  type: string;
  Component: ComponentType<SectionComponentProps>;
  group: "hero" | "catalog" | "trust" | "content" | "tools" | "product";
  label: string;
  icon: string;
}

// Lazy import all sections
import { HeroSlider } from "./HeroSlider";
import { PromoStrip } from "./PromoStrip";
import { CategoryTiles } from "./CategoryTiles";
import { FeaturedProducts } from "./FeaturedProducts";
import { PriceBoard } from "./PriceBoard";
import { Advantages } from "./Advantages";
import { CalculatorSection } from "./CalculatorSection";
import { DeliveryZones } from "./DeliveryZones";
import { Steps } from "./Steps";
import { BlogTeasers } from "./BlogTeasers";
import { Faq } from "./Faq";
import { CtaBanner } from "./CtaBanner";
import { Contacts } from "./Contacts";
import { RichText } from "./RichText";
import { Spacer } from "./Spacer";
import { Divider } from "./Divider";
import { ProductDescription } from "./ProductDescription";
import { ProductSpecs } from "./ProductSpecs";
import { ProductCalculator } from "./ProductCalculator";
import { ProductDelivery } from "./ProductDelivery";
import { SimilarProducts } from "./SimilarProducts";

const REGISTRY: Record<string, SectionEntry> = {};

function register(entry: SectionEntry) {
  REGISTRY[entry.type] = entry;
}

register({ type: "HeroSlider", Component: HeroSlider, group: "hero", label: "Hero-слайдер", icon: "GalleryHorizontalEnd" });
register({ type: "PromoStrip", Component: PromoStrip, group: "trust", label: "Промо-полоса", icon: "StripBanner" });
register({ type: "CategoryTiles", Component: CategoryTiles, group: "catalog", label: "Плитки категорий", icon: "Grid3x3" });
register({ type: "FeaturedProducts", Component: FeaturedProducts, group: "catalog", label: "Товары (витрина)", icon: "Package" });
register({ type: "PriceBoard", Component: PriceBoard, group: "catalog", label: "Прайс-доска", icon: "Table" });
register({ type: "Advantages", Component: Advantages, group: "trust", label: "Преимущества", icon: "BadgeCheck" });
register({ type: "Calculator", Component: CalculatorSection, group: "tools", label: "Калькулятор", icon: "Calculator" });
register({ type: "DeliveryZones", Component: DeliveryZones, group: "trust", label: "Зоны доставки", icon: "MapPin" });
register({ type: "Steps", Component: Steps, group: "content", label: "Шаги", icon: "ListOrdered" });
register({ type: "BlogTeasers", Component: BlogTeasers, group: "content", label: "Статьи", icon: "Newspaper" });
register({ type: "Faq", Component: Faq, group: "content", label: "FAQ", icon: "HelpCircle" });
register({ type: "CtaBanner", Component: CtaBanner, group: "content", label: "CTA-баннер", icon: "Megaphone" });
register({ type: "Contacts", Component: Contacts, group: "content", label: "Контакты", icon: "Phone" });
register({ type: "RichText", Component: RichText, group: "content", label: "Текст", icon: "Type" });
register({ type: "Spacer", Component: Spacer, group: "content", label: "Отступ", icon: "MoveVertical" });
register({ type: "Divider", Component: Divider, group: "content", label: "Разделитель", icon: "Minus" });
register({ type: "ProductDescription", Component: ProductDescription, group: "product", label: "Описание товара", icon: "FileText" });
register({ type: "ProductSpecs", Component: ProductSpecs, group: "product", label: "Характеристики", icon: "List" });
register({ type: "ProductCalculator", Component: ProductCalculator, group: "product", label: "Калькулятор товара", icon: "Calculator" });
register({ type: "ProductDelivery", Component: ProductDelivery, group: "product", label: "Доставка товара", icon: "Truck" });
register({ type: "SimilarProducts", Component: SimilarProducts, group: "product", label: "Похожие товары", icon: "Package" });

export function getSectionComponent(type: string): SectionEntry | null {
  return REGISTRY[type] ?? null;
}

export function getAllSections(): SectionEntry[] {
  return Object.values(REGISTRY);
}
