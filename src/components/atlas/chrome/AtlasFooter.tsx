"use client";

import { useState } from "react";
import { ChevronDown, CreditCard, Banknote, FileText } from "lucide-react";
import type { AtlasConfig } from "@/lib/atlas/config-schema";

export function AtlasFooter({
  config,
  zones,
}: {
  config: AtlasConfig;
  zones: { slug: string; name: string }[];
}) {
  const f = config.footer;
  const [openCol, setOpenCol] = useState<number | null>(null);

  return (
    <footer style={{ background: "var(--atlas-secondary)", color: "#fff" }} className="mt-12">
      <div className="atlas-container py-12">
        {/* Desktop columns */}
        <div className="hidden md:grid grid-cols-4 gap-8">
          {f.columns.map((col, i) => (
            <div key={i}>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 opacity-90">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href} className="text-sm opacity-70 hover:opacity-100 hover:text-[var(--atlas-primary)] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden space-y-2">
          {f.columns.map((col, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                className="w-full flex items-center justify-between py-3 font-semibold text-sm"
                onClick={() => setOpenCol(openCol === i ? null : i)}
              >
                {col.title}
                <ChevronDown size={16} style={{ transform: openCol === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {openCol === i && (
                <ul className="pb-3 space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href={link.href} className="text-sm opacity-70 hover:opacity-100 block py-1">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Zones */}
        {f.showZones && zones.length > 0 && (
          <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3 opacity-90">Зоны доставки</h4>
            <div className="flex flex-wrap gap-2">
              {zones.slice(0, 34).map((z) => (
                <a
                  key={z.slug}
                  href={`/geo/${z.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs opacity-70 hover:opacity-100 transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  {z.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-xs opacity-60">{f.requisites}</div>
          <div className="text-xs opacity-60">{f.copyright}</div>
          <div className="flex items-center gap-3">
            {f.payments.includes("card") && (
              <span className="flex items-center gap-1 text-xs opacity-70">
                <CreditCard size={16} /> Карта
              </span>
            )}
            {f.payments.includes("cash") && (
              <span className="flex items-center gap-1 text-xs opacity-70">
                <Banknote size={16} /> Наличные
              </span>
            )}
            {f.payments.includes("invoice") && (
              <span className="flex items-center gap-1 text-xs opacity-70">
                <FileText size={16} /> Счёт
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
