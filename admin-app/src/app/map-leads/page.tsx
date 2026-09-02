"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, Phone, Mail, ExternalLink, Sparkles, Filter } from "lucide-react";
import { listMapLeads, generateProposal, type MapLead } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const CATEGORY_LABELS: Record<string, string> = {
  construction_site: "Стройплощадка",
  concrete_plant: "Бетонный завод",
  contractor_office: "Офис застройщика",
  building_site: "Жилой комплекс",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  queued_email: "В очереди (email)",
  queued_whatsapp: "В очереди (WhatsApp)",
  sent: "Отправлено",
  replied: "Ответ получен",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  queued_email: "bg-blue-100 text-blue-700",
  queued_whatsapp: "bg-green-100 text-green-700",
  sent: "bg-purple-100 text-purple-700",
  replied: "bg-amber-100 text-amber-700",
};

export default function MapLeadsPage() {
  const [leads, setLeads] = useState<MapLead[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<MapLead | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await listMapLeads({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate(leadId: string) {
    setGeneratingId(leadId);
    try {
      await generateProposal(leadId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Лиды с карт</h1>
          <p className="text-sm text-muted-foreground">
            Строительные объекты с Яндекс/Google Maps — всего: {total}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Все категории</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Button variant="outline" onClick={load} className="gap-2">
          <Filter className="h-4 w-4" /> Обновить
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {leads === null ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Лиды не найдены</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Компания</th>
                <th className="px-4 py-3 text-left font-semibold">Категория</th>
                <th className="px-4 py-3 text-left font-semibold">Адрес</th>
                <th className="px-4 py-3 text-left font-semibold">Контакты</th>
                <th className="px-4 py-3 text-left font-semibold">Логистика</th>
                <th className="px-4 py-3 text-left font-semibold">Статус КП</th>
                <th className="px-4 py-3 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{lead.businessName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {CATEGORY_LABELS[lead.category] || lead.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {lead.address}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    {lead.phone && (
                      <span className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </span>
                    )}
                    {lead.email && (
                      <span className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3" /> {lead.email}
                      </span>
                    )}
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <ExternalLink className="h-3 w-3" /> сайт
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    {lead.logisticsCost ? `${Math.round(Number(lead.logisticsCost)).toLocaleString("ru-RU")} ₽` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.proposalStatus] || "bg-slate-100"}`}>
                      {STATUS_LABELS[lead.proposalStatus] || lead.proposalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {lead.proposalText && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                        КП
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleGenerate(lead.id)}
                      disabled={generatingId === lead.id}
                      className="gap-1"
                    >
                      {generatingId === lead.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      КП
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Proposal modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedLead(null)}>
          <div className="max-w-2xl w-full bg-white rounded-2xl p-8 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">КП: {selectedLead.businessName}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)}>✕</Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">{selectedLead.proposalText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
