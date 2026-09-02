import { listBlueprints } from "@/lib/striker-blueprints";
import { createBlueprint } from "@/types/striker-engine";
import StrikerWorkspace from "./StrikerWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Конструктор тем — Песок-Металл",
  description: "Создание и настройка дизайна сайта без программирования",
};

export default async function StrikerEnginePage() {
  const saved = await listBlueprints();
  const initial = saved[0] ? structuredClone(saved[0]) : createBlueprint("Новый чертёж");

  return (
    <div className="flex h-full min-h-[600px] flex-col">
      <StrikerWorkspace saved={saved} initial={initial} />
    </div>
  );
}
