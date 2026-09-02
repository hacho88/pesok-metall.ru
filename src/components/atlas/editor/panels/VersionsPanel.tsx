"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "../editor-store";
import { RotateCcw, History, Check } from "lucide-react";

interface Version {
  id: string;
  version: number;
  note: string | null;
  createdAt: string;
}

export function VersionsPanel() {
  const store = useEditorStore();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const resp = await fetch("/api/atlas/config/versions");
      if (resp.ok) {
        const data = await resp.json();
        setVersions(data.versions);
      }
    } finally {
      setLoading(false);
    }
  };

  const restore = async (version: number) => {
    setRestoring(version);
    try {
      const resp = await fetch("/api/atlas/config/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      });
      if (resp.ok) {
        const data = await resp.json();
        store.setConfig(data.config);
      }
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="p-4 space-y-3">
    <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
      <History size={18} /> Версии
    </h3>

    {loading ? (
      <div className="text-sm text-slate-400">Загрузка...</div>
    ) : versions.length === 0 ? (
      <div className="text-sm text-slate-400">Версий пока нет</div>
    ) : (
      <div className="space-y-1">
        {versions.map((v) => (
          <div key={v.id} className="p-2 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">v{v.version}</span>
              <button
                className="flex items-center gap-1 text-xs text-orange-600 hover:bg-orange-50 px-2 py-1 rounded disabled:opacity-50"
                onClick={() => restore(v.version)}
                disabled={restoring === v.version}
              >
                {restoring === v.version ? "..." : <><RotateCcw size={12} /> Восстановить</>}
              </button>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {v.note || "Без примечания"}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {new Date(v.createdAt).toLocaleString("ru-RU")}
            </div>
          </div>
        ))}
      </div>
    )}
    </div>
  );
}
