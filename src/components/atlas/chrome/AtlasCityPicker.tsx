"use client";

import { useState, useEffect } from "react";
import { MapPin, X, Search } from "lucide-react";

export function AtlasCityPicker({
  open,
  onClose,
  zones,
  currentSlug,
}: {
  open: boolean;
  onClose: () => void;
  zones: { slug: string; name: string }[];
  currentSlug: string | null;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  const filtered = zones.filter((z) =>
    z.name.toLowerCase().includes(query.toLowerCase())
  );

  const select = (slug: string) => {
    document.cookie = `atlas_zone=${slug}; path=/; max-age=${60 * 60 * 24 * 365}`;
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl shadow-lg overflow-hidden"
        style={{ background: "var(--atlas-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--atlas-border)" }}>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MapPin size={20} style={{ color: "var(--atlas-primary)" }} />
            Выбор города
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--atlas-surface-2)]">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--atlas-text-muted)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти город..."
              className="atlas-input pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto atlas-scroll">
            {filtered.map((zone) => (
              <button
                key={zone.slug}
                onClick={() => select(zone.slug)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--atlas-surface-2)] transition-colors flex items-center justify-between"
                style={{
                  background: zone.slug === currentSlug ? "var(--atlas-surface-2)" : "transparent",
                  color: zone.slug === currentSlug ? "var(--atlas-primary)" : "var(--atlas-text)",
                }}
              >
                {zone.name}
                {zone.slug === currentSlug && <span style={{ color: "var(--atlas-primary)" }}>✓</span>}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: "var(--atlas-text-muted)" }}>
                Город не найден
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
