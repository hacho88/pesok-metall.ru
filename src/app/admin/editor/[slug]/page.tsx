import { PageEditor } from "@/components/admin/PageEditor";
import { getPageConfig } from "@/lib/page-config";

interface EditorPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditorPage({ params }: EditorPageProps) {
  const { slug } = await params;
  const config = await getPageConfig(slug);
  return <PageEditor initialConfig={config} />;
}
