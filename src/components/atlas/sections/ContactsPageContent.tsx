"use client";

import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { AtlasBreadcrumbs } from "../catalog/AtlasBreadcrumbs";
import type { AtlasConfig } from "@/lib/atlas/config-schema";

export function ContactsPageContent({ config }: { config: AtlasConfig }) {
  const h = config.header;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!phone.trim()) return;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message, source: "contacts" }),
      });
    } catch {}
    setSent(true);
  };

  return (
    <div className="atlas-fade-in">
      <AtlasBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />

      <h1 className="text-3xl font-bold mt-4 mb-6 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)" }}>
        Контакты
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          <div className="atlas-card p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)" }}>
              <Phone size={24} style={{ color: "var(--atlas-primary)" }} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Телефон</h3>
              {h.phones.map((p, i) => (
                <a key={i} href={`tel:${p.replace(/[^+\d]/g, "")}`} className="block text-lg font-medium hover:text-[var(--atlas-primary)] transition-colors atlas-link-hover">
                  {p}
                </a>
              ))}
            </div>
          </div>

          <div className="atlas-card p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)" }}>
              <Mail size={24} style={{ color: "var(--atlas-primary)" }} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Email</h3>
              <a href={`mailto:${h.email}`} className="text-lg font-medium hover:text-[var(--atlas-primary)] transition-colors atlas-link-hover">
                {h.email}
              </a>
            </div>
          </div>

          <div className="atlas-card p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)" }}>
              <MapPin size={24} style={{ color: "var(--atlas-primary)" }} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Адрес склада</h3>
              <p className="text-base" style={{ color: "var(--atlas-text-muted)" }}>Москва, склад металлопроката</p>
            </div>
          </div>

          <div className="atlas-card p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)" }}>
              <Clock size={24} style={{ color: "var(--atlas-primary)" }} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Режим работы</h3>
              <p className="text-base" style={{ color: "var(--atlas-text-muted)" }}>{h.workHours}</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="atlas-card atlas-card-elevated p-6">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "color-mix(in srgb, var(--atlas-success) 12%, transparent)" }}>
                <Send size={32} style={{ color: "var(--atlas-success)" }} />
              </div>
              <p className="text-lg font-bold">Сообщение отправлено!</p>
              <p className="text-sm mt-1" style={{ color: "var(--atlas-text-muted)" }}>Менеджер свяжется в течение 15 минут</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Написать нам</h2>
              <div className="space-y-3">
                <input className="atlas-input" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="atlas-input" placeholder="+7 (___) ___-__-__" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <textarea className="atlas-input" rows={4} placeholder="Ваше сообщение" value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="atlas-btn atlas-btn-primary w-full atlas-btn-lg" onClick={submit} disabled={!phone.trim()}>
                  <Send size={18} /> Отправить
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="mt-8 rounded-xl overflow-hidden" style={{ height: 400, border: "1px solid var(--atlas-border)" }}>
        <iframe
          src="https://yandex.ru/map-widget/v1/?ll=37.617635%2C55.755814&z=10"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Карта"
        />
      </div>
    </div>
  );
}
