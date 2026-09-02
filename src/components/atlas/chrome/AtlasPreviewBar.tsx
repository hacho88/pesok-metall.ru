"use client";

import { Eye, X } from "lucide-react";

export function AtlasPreviewBar() {
  return (
    <div
      className="sticky top-0 z-[60] flex items-center justify-between px-4 py-2 text-sm font-medium"
      style={{ background: "var(--atlas-warning)", color: "#fff" }}
    >
      <span className="flex items-center gap-2">
        <Eye size={16} />
        Предпросмотр черновика
      </span>
      <a
        href="/api/atlas/preview?exit=1"
        className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
        style={{ background: "rgba(255,255,255,0.2)" }}
      >
        <X size={14} />
        Выйти
      </a>
    </div>
  );
}
