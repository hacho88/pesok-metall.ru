"use client";

import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { sanitizeCustomHtml } from "@/lib/atlas/sanitize";
import type { SectionComponentProps } from "./index";

export function Contacts({ props }: SectionComponentProps) {
  const title = (props.title as string) ?? "Контакты";
  const address = (props.address as string) ?? "";
  const phones = (props.phones as string[]) ?? [];
  const email = (props.email as string) ?? "";
  const workHours = (props.workHours as string) ?? "";
  const mapUrl = (props.mapUrl as string) ?? "";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {address && (
            <div className="flex items-start gap-3">
              <MapPin size={20} style={{ color: "var(--atlas-primary)" }} className="shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium uppercase" style={{ color: "var(--atlas-text-muted)" }}>Адрес</div>
                <div className="text-sm">{address}</div>
              </div>
            </div>
          )}
          {phones.map((phone, i) => (
            <div key={i} className="flex items-start gap-3">
              <Phone size={20} style={{ color: "var(--atlas-primary)" }} className="shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium uppercase" style={{ color: "var(--atlas-text-muted)" }}>Телефон</div>
                <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="text-sm font-medium hover:text-[var(--atlas-primary)]">{phone}</a>
              </div>
            </div>
          ))}
          {email && (
            <div className="flex items-start gap-3">
              <Mail size={20} style={{ color: "var(--atlas-primary)" }} className="shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium uppercase" style={{ color: "var(--atlas-text-muted)" }}>Email</div>
                <a href={`mailto:${email}`} className="text-sm hover:text-[var(--atlas-primary)]">{email}</a>
              </div>
            </div>
          )}
          {workHours && (
            <div className="flex items-start gap-3">
              <Clock size={20} style={{ color: "var(--atlas-primary)" }} className="shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium uppercase" style={{ color: "var(--atlas-text-muted)" }}>Часы работы</div>
                <div className="text-sm">{workHours}</div>
              </div>
            </div>
          )}
        </div>
        {mapUrl && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--atlas-border)", minHeight: 300 }}>
            <iframe
              src={mapUrl}
              width="100%"
              height="300"
              frameBorder="0"
              allowFullScreen
              title="Карта"
            />
          </div>
        )}
      </div>
    </div>
  );
}
