/** Минимальные типы компонентов (ранее часть striker-engine) */

export interface ProductCardComponentsConfig {
  showImage?: boolean;
  showStock?: boolean;
  showGost?: boolean;
  showWeight?: boolean;
  showPricePerTon?: boolean;
  showGostBadge?: boolean;
  showRating?: boolean;
  imageRatio?: "square" | "4/3" | "16/9";
  cardBorderRadius?: number | string;
  cardLayoutVariant?: string;
  stockStatusType?: string;
}

export interface UnitSelectorComponentsConfig {
  showLabel?: boolean;
  variant?: "default" | "compact";
  selectVariant?: SelectVariant;
}

export interface CatalogComponentsConfig {
  columns?: 2 | 3 | 4;
  showFilters?: boolean;
  showSort?: boolean;
  categoryStyle?: string;
  grainOpacity?: number;
}

export type CheckoutLayout = string | {
  steps?: string[];
  showSummary?: boolean;
};

export type SelectVariant = string;
