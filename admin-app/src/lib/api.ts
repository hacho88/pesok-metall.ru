// Клиент API основного сайта (pesok-metall.ru)
import type { PageConfig, ThemePreset } from "@/types/page-builder";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

export interface AdminPageRow {
  slug: string;
  theme: string;
  blockCount: number;
  updatedAt: string;
}

export type ProductType = "METALL" | "BAG_30KG" | "BIG_BAG_1TON" | "GENERAL_CONSTRUCTION";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  categoryId: string;
  categoryName: string;
  priceRetailBase: string | null;
  priceCost: string | null;
  isOnOrder: boolean;
  weightKg: string;
  unit: string | null;
  stock: number;
  imageUrl: string | null;
  imageLocal: string | null;
  attributes: { key: string; value: string }[];
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  sectionId: string | null;
  sectionName: string | null;
  sortOrder: number;
}

export interface AdminSection {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
}

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";

export interface AdminLead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  message: string | null;
  status: LeadStatus;
  createdAt: string;
}

export interface AdminCampaign {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  priceRetailBase: string | null;
  yandexDirectId: string | null;
  cpcBid: string;
  maxBidLimit: string;
  isActive: boolean;
  clicks: number;
  conversions: number;
  roi: string | null;
}

export interface AdminFleetVehicle {
  id: string;
  name: string;
  maxWeightKg: string;
  maxLengthMeters: string;
  baseFare: string;
  perKmCharge: string;
  isActive: boolean;
}

export type FleetPayload = Partial<Omit<AdminFleetVehicle, "maxWeightKg" | "maxLengthMeters" | "baseFare" | "perKmCharge">> & {
  maxWeightKg?: string | number;
  maxLengthMeters?: string | number;
  baseFare?: string | number;
  perKmCharge?: string | number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error ?? `HTTP ${response.status}`
    );
  }
  return data as T;
}

export function listPages(): Promise<{ pages: AdminPageRow[] }> {
  return request("/api/admin/pages");
}

export function listFleet(): Promise<{ fleet: AdminFleetVehicle[] }> {
  return request("/api/admin/fleet");
}

export function createFleet(data: FleetPayload): Promise<AdminFleetVehicle> {
  return request("/api/admin/fleet", { method: "POST", body: JSON.stringify(data) });
}

export function updateFleet(id: string, data: FleetPayload): Promise<AdminFleetVehicle> {
  return request(`/api/admin/fleet/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteFleet(id: string): Promise<{ success: boolean }> {
  return request(`/api/admin/fleet/${id}`, { method: "DELETE" });
}

export function getPageConfig(slug: string): Promise<{ config: PageConfig }> {
  return request(`/api/admin/pages/${encodeURIComponent(slug)}`);
}

export function savePageConfig(config: PageConfig): Promise<{ ok: boolean }> {
  return request("/api/admin/pages", {
    method: "PUT",
    body: JSON.stringify({
      slug: config.slug,
      theme: config.theme,
      blocks: config.blocks,
    }),
  });
}

export function generatePageConfig(
  prompt: string,
  slug: string,
  theme?: ThemePreset
): Promise<{ config: PageConfig }> {
  return request("/api/admin/pages/generate", {
    method: "POST",
    body: JSON.stringify({ prompt, slug, theme }),
  });
}

// ---- Товары ----
export function listProducts(params?: {
  search?: string;
  categoryId?: string;
  type?: string;
}): Promise<{ total: number; products: AdminProduct[] }> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.categoryId) qs.set("categoryId", params.categoryId);
  if (params?.type) qs.set("type", params.type);
  return request(`/api/admin/products?${qs.toString()}`);
}

export function createProduct(data: Record<string, unknown>): Promise<{ ok: boolean }> {
  return request("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
}

export function updateProduct(
  id: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean }> {
  return request(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteProduct(id: string): Promise<{ ok: boolean }> {
  return request(`/api/admin/products/${id}`, { method: "DELETE" });
}

export function generateSeoDescription(data: {
  name: string;
  category: string;
  attributes?: { key: string; value: string }[];
  price?: string;
  unit?: string;
}): Promise<{ description: string }> {
  return request("/api/admin/products/generate-seo", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Категории ----
export function listCategories(): Promise<{ categories: AdminCategory[]; sections: AdminSection[] }> {
  return request("/api/admin/categories");
}

export function createCategory(data: {
  name: string;
  parentId?: string | null;
  sectionId?: string | null;
  sortOrder?: number;
}): Promise<{ ok: boolean }> {
  return request("/api/admin/categories", { method: "POST", body: JSON.stringify(data) });
}

export function updateCategory(
  id: string,
  data: { name: string; parentId?: string | null; slug?: string; sectionId?: string | null; sortOrder?: number }
): Promise<{ ok: boolean }> {
  return request(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteCategory(id: string): Promise<{ ok: boolean }> {
  return request(`/api/admin/categories/${id}`, { method: "DELETE" });
}

// ---- Клиенты (заявки) ----
export function listLeads(params?: {
  status?: LeadStatus;
  source?: string;
}): Promise<{ leads: AdminLead[] }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.source) qs.set("source", params.source);
  return request(`/api/admin/leads?${qs.toString()}`);
}

export function updateLeadStatus(id: string, status: LeadStatus): Promise<{ ok: boolean }> {
  return request(`/api/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function deleteLead(id: string): Promise<{ ok: boolean }> {
  return request(`/api/admin/leads/${id}`, { method: "DELETE" });
}

// ---- Реклама ----
export function listAdvertising(): Promise<{ campaigns: AdminCampaign[] }> {
  return request("/api/admin/advertising");
}

export function updateAdvertising(
  id: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean }> {
  return request(`/api/admin/advertising/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  seoDescription: string | null;
  product?: { name: string } | null;
  createdAt: string;
}

export function getCatalogTree(): Promise<any[]> {
  return request("/api/admin/catalog/tree");
}

export function listBlogPosts(): Promise<AdminBlogPost[]> {
  return request("/api/admin/blog");
}

export function generateBlogPosts(): Promise<{ success: boolean }> {
  return request("/api/cron/seo-generator");
}

export function deleteBlogPost(id: string): Promise<{ success: boolean }> {
  return request(`/api/admin/blog/${id}`, { method: "DELETE" });
}

export function updateBlogPost(id: string, data: any): Promise<AdminBlogPost> {
  return request(`/api/admin/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function updateMarketingBanner(data: any): Promise<{ ok: boolean }> {
  return request("/api/admin/marketing/banner", { method: "PATCH", body: JSON.stringify(data) });
}

export function getMarketingSettings(): Promise<any> {
  return request("/api/admin/marketing/settings");
}

export function updateMarketingSettings(data: any): Promise<{ success: boolean }> {
  return request("/api/admin/marketing/settings", { method: "PATCH", body: JSON.stringify(data) });
}

// ---- Map Leads ----
export interface MapLead {
  id: string;
  businessName: string;
  category: string;
  address: string;
  lat: string;
  lng: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  zoneSlug: string | null;
  logisticsCost: string | null;
  proposalText: string | null;
  proposalStatus: string;
  createdAt: string;
}

export function listMapLeads(params?: { status?: string; category?: string; page?: number }): Promise<{ leads: MapLead[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.category) qs.set("category", params.category);
  if (params?.page) qs.set("page", String(params.page));
  return request(`/api/admin/map-leads?${qs.toString()}`);
}

export function generateProposal(leadId: string): Promise<{ success: boolean; subject: string; body: string }> {
  return request("/api/admin/map-leads", { method: "POST", body: JSON.stringify({ leadId }) });
}

// ---- Advertising AI ----
export interface BudgetPrediction {
  recommendedDailyBudget: number;
  expectedClicks: number;
  expectedConversions: number;
  expectedRevenue: number;
  expectedProfit: number;
  roas: number;
  allocation: Array<{ productName: string; budgetShare: number; reason: string }>;
  reasoning: string;
  campaignsAnalyzed: number;
}

export function getBudgetPrediction(): Promise<BudgetPrediction> {
  return request("/api/admin/advertising/predict");
}

export function runBidAnalysis(productId?: string): Promise<{ analyzed: number; results: Array<{ productName: string; result: any }> }> {
  return request("/api/admin/advertising/predict", { method: "POST", body: JSON.stringify({ productId }) });
}

// ---- Tenders ----
export interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  customer: string;
  initialPrice: number;
  calculatedCost: number;
  aiStatus: "RECOMMENDED" | "REJECTED" | "HOLD";
  aiReport: string;
  createdAt: string;
}

export function listTenders(params?: { status?: string; page?: number }): Promise<{ tenders: Tender[]; total: number; page: number; limit: number }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  return request(`/api/admin/tenders?${qs.toString()}`);
}

export function updateTender(id: string, data: { aiStatus?: string; aiReport?: string }): Promise<Tender> {
  return request("/api/admin/tenders", { method: "PATCH", body: JSON.stringify({ id, ...data }) });
}
