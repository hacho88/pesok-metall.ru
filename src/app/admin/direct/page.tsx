import { Megaphone } from "lucide-react";
import { DirectManager } from "./DirectManager";

export const dynamic = "force-dynamic";

export default function AdminDirectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25">
          <Megaphone className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Яндекс.Директ</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Кампании, расход и статистика рекламы
          </p>
        </div>
      </div>

      <DirectManager />
    </div>
  );
}
