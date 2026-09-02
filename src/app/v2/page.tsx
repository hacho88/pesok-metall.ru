import type { Metadata } from "next";
import { PageBuilder } from "@/lib/page-builder";
import { getPageConfig } from "@/lib/page-config";
import { DefaultLayout } from "@/components/layout/DefaultLayout";

export const metadata: Metadata = {
  title: "Вариант 2 — Modern Blue",
  description: "Второй вариант оформления главной страницы — современная сине-стальная тема.",
};

export const dynamic = "force-dynamic";

export default async function HomeV2Page() {
  const config = await getPageConfig("home-v2");
  return (
    <DefaultLayout>
      <PageBuilder config={config} />
    </DefaultLayout>
  );
}
