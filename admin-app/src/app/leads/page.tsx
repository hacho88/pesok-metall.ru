"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Phone, Trash2, Users } from "lucide-react";
import {
  listLeads,
  updateLeadStatus,
  deleteLead,
  type AdminLead,
  type LeadStatus,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новая",
  CONTACTED: "Связались",
  QUALIFIED: "Квалифицирован",
  WON: "Победа",
  LOST: "Потерян",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  QUALIFIED: "bg-violet-100 text-violet-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-gray-200 text-gray-600",
};

const SOURCE_LABELS: Record<string, string> = {
  chat: "Чат",
  invoice: "Счёт",
  calculator: "Калькулятор",
  form: "Форма",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<AdminLead[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listLeads({
        status: (statusFilter as LeadStatus) || undefined,
        source: sourceFilter || undefined,
      });
      setLeads(data.leads);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [statusFilter, sourceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(lead: AdminLead, status: LeadStatus) {
    try {
      await updateLeadStatus(lead.id, status);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function remove(lead: AdminLead) {
    if (!confirm(`Удалить заявку от «${lead.name}»?`)) return;
    try {
      await deleteLead(lead.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const newCount = leads?.filter((l) => l.status === "NEW").length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Users className="h-6 w-6 text-primary" />
            Клиенты
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Заявки с сайта: чат, счёт, формы
            {newCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {newCount} новых
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <option value="">Все статусы</option>
          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-44"
        >
          <option value="">Все источники</option>
          {Object.entries(SOURCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!leads && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Загрузка заявок…
        </div>
      )}

      {leads && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Источник</th>
                <th className="px-4 py-3 font-medium">Контекст</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b last:border-0 align-top hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{l.name}</p>
                    <a
                      href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {l.phone}
                    </a>
                    {l.email && (
                      <p className="text-xs text-muted-foreground">{l.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {SOURCE_LABELS[l.source] ?? l.source}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    {l.message ? (
                      <p className="whitespace-pre-line text-xs text-muted-foreground line-clamp-3">
                        {l.message}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(l.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={l.status}
                      onChange={(e) => changeStatus(l, e.target.value as LeadStatus)}
                      className="w-40"
                    >
                      {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </Select>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[l.status]}`}
                    >
                      {STATUS_LABELS[l.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(l)}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Заявок пока нет. Они появятся из чата, счёта и форм на сайте.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
