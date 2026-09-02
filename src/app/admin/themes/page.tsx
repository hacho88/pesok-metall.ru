import type { Metadata } from "next";
import ThemesAdmin from "@/components/admin/ThemesAdmin";

export const metadata: Metadata = {
  title: "Темы оформления — админка",
};

export const dynamic = "force-dynamic";

export default function ThemesPage() {
  return <ThemesAdmin />;
}
