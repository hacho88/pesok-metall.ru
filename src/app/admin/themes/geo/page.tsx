import type { Metadata } from "next";
import GeoThemesAdmin from "@/components/admin/GeoThemesAdmin";

export const metadata: Metadata = {
  title: "Геозоны и SEO — админка",
};

export const dynamic = "force-dynamic";

export default function GeoThemesPage() {
  return <GeoThemesAdmin />;
}
