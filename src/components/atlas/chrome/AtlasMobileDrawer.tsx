"use client";

import { X, Grid3x3, Phone, Mail, Clock } from "lucide-react";
import type { AtlasHeader } from "@/lib/atlas/config-schema";

export function AtlasMobileDrawer({
  open,
  onClose,
  config,
  zones,
}: {
  open: boolean;
  onClose: () => void;
  config: AtlasHeader;
  zones: { slug: string; name: string }[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] overflow-y-auto atlas-scroll"
        style={{ background: "var(--atlas-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--atlas-border)" }}>
          <span className="font-bold text-lg">Меню</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--atlas-surface-2)]">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          <a href="/catalog" className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium hover:bg-[var(--atlas-surface-2)]">
            <Grid3x3 size={20} style={{ color: "var(--atlas-primary)" }} />
            Каталог
          </a>
          {config.menu.map((item, i) => (
            <a key={i} href={item.href} className="block px-3 py-3 rounded-lg font-medium hover:bg-[var(--atlas-surface-2)]">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--atlas-border)" }}>
          {config.phones.map((phone, i) => (
            <a key={i} href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 font-bold">
              <Phone size={18} style={{ color: "var(--atlas-primary)" }} />
              {phone}
            </a>
          ))}
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--atlas-text-muted)" }}>
            <Clock size={16} />
            {config.workHours}
          </div>
          <a href={`mailto:${config.email}`} className="flex items-center gap-2 text-sm" style={{ color: "var(--atlas-text-muted)" }}>
            <Mail size={16} />
            {config.email}
          </a>
        </div>
      </div>
    </div>
  );
}
