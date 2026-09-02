"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import type { SectionComponentProps } from "./index";

export function CtaBanner({ props }: SectionComponentProps) {
  const title = (props.title as string) ?? "";
  const text = (props.text as string) ?? "";
  const ctaLabel = (props.ctaLabel as string) ?? "Заказать звонок";
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!phone.trim()) return;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Заявка с сайта", phone, source: "cta_banner", message: title }),
      });
    } catch {}
    setSent(true);
  };

  return (
    <div className="rounded-xl p-8 text-center" style={{ background: "var(--atlas-secondary)", color: "#fff" }}>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="opacity-80 mb-6 max-w-xl mx-auto">{text}</p>
      {sent ? (
        <div className="text-lg font-semibold" style={{ color: "var(--atlas-primary)" }}>
          Спасибо! Менеджер свяжется с вами в течение 15 минут.
        </div>
      ) : (
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            className="atlas-input flex-1"
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
          />
          <button onClick={submit} className="atlas-btn atlas-btn-primary">
            <Phone size={18} />
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  );
}
