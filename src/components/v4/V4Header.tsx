"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  FileCheck2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
  User,
  X,
} from "lucide-react";
import { GEO_ZONES } from "@/lib/geo-zones";
import { cn } from "@/lib/utils";

const QUICK_TAGS = [
  "Арматура 12мм",
  "Труба профильная",
  "Песок речной (тонны)",
  "Щебень 20-40",
];

interface SearchHit {
  name: string;
  category: string;
  domain: "metal" | "sand";
}

const MOCK_SEARCH: Record<string, SearchHit[]> = {
  арматура: [
    { name: "Арматура А500С 12мм", category: "Арматура", domain: "metal" },
    { name: "Арматура А500С 16мм", category: "Арматура", domain: "metal" },
    { name: "Арматура А240 8мм", category: "Арматура", domain: "metal" },
  ],
  труба: [
    { name: "Труба профильная 40х20х2", category: "Трубы", domain: "metal" },
    { name: "Труба электросварная 50мм", category: "Трубы", domain: "metal" },
    { name: "Труба ВГП оцинкованная 25мм", category: "Трубы", domain: "metal" },
  ],
  песок: [
    { name: "Песок речной (тонна)", category: "Песок", domain: "sand" },
    { name: "Песок карьерный (м³)", category: "Песок", domain: "sand" },
    { name: "Песок мытый (мешок 30кг)", category: "Песок", domain: "sand" },
  ],
  щебень: [
    { name: "Щебень гранитный 20-40 (тонна)", category: "Щебень", domain: "sand" },
    { name: "Щебень известняковый 5-20 (м³)", category: "Щебень", domain: "sand" },
  ],
};

export function V4Header() {
  const [mode, setMode] = useState<"b2b" | "b2c">("b2b");
  const [geoOpen, setGeoOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [callSent, setCallSent] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const hits: SearchHit[] = [];
    for (const [key, items] of Object.entries(MOCK_SEARCH)) {
      if (key.includes(q) || q.includes(key)) hits.push(...items);
    }
    if (hits.length === 0) {
      const all = Object.values(MOCK_SEARCH).flat();
      hits.push(...all.filter((h) => h.name.toLowerCase().includes(q)).slice(0, 6));
    }
    return hits.slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setFocused(false);
      if (geoRef.current && !geoRef.current.contains(e.target as Node)) setGeoOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const metalHits = results.filter((r) => r.domain === "metal");
  const sandHits = results.filter((r) => r.domain === "sand");

  return (
    <header className="sticky top-0 z-50 border-b border-[#3A3F44] bg-[#1A1D20] text-[#F4EBE1]">
      {/* Top bar */}
      <div className="border-b border-[#3A3F44]/60">
        <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Geo selector */}
          <div className="relative" ref={geoRef}>
            <button
              type="button"
              onClick={() => setGeoOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E6D5BC] transition-colors hover:text-[#FF6B00]"
            >
              <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
              Москва и МО
              <ChevronDown className={cn("h-3 w-3 transition-transform", geoOpen && "rotate-180")} />
            </button>
            {geoOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-72 border border-[#3A3F44] bg-[#1A1D20] p-3 shadow-2xl">
                <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-[#E6D5BC]/50">
                  Выберите город доставки
                </p>
                <div className="grid max-h-60 grid-cols-2 gap-1 overflow-y-auto">
                  {GEO_ZONES.slice(0, 20).map((z) => (
                    <Link
                      key={z.slug}
                      href={`/geo/${z.slug}`}
                      onClick={() => setGeoOpen(false)}
                      className="rounded px-2 py-1.5 text-xs font-semibold text-[#F4EBE1]/70 transition-colors hover:bg-[#2B3035] hover:text-[#FF6B00]"
                    >
                      {z.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* B2B/B2C toggle */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E6D5BC]/50">Режим:</span>
            <div className="flex items-center rounded-full border border-[#3A3F44] bg-[#2B3035] p-0.5">
              <button
                type="button"
                onClick={() => setMode("b2b")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  mode === "b2b" ? "bg-[#FF6B00] text-[#1A1D20]" : "text-[#E6D5BC]/60 hover:text-[#F4EBE1]"
                )}
              >
                <Building2 className="h-3 w-3" />
                B2B
              </button>
              <button
                type="button"
                onClick={() => setMode("b2c")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  mode === "b2c" ? "bg-[#FF6B00] text-[#1A1D20]" : "text-[#E6D5BC]/60 hover:text-[#F4EBE1]"
                )}
              >
                <User className="h-3 w-3" />
                B2C
              </button>
            </div>
          </div>

          {/* Certificates */}
          <div className="hidden items-center gap-4 md:flex">
            <a href="/#certificates" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E6D5BC]/70 transition-colors hover:text-[#FF6B00]">
              <FileCheck2 className="h-3.5 w-3.5" />
              Сертификаты / ГОСТ
            </a>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9900]">
              {mode === "b2b" ? "Оптовые цены для юр. лиц" : "Розница со склада"}
            </span>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/v4" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center border-2 border-[#FF6B00] bg-[#2B3035] text-lg font-black text-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.3)]">
            P
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-base font-black uppercase tracking-tight text-[#F4EBE1]">
              PESOK<span className="text-[#FF6B00]">-</span>METALL
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#E6D5BC]/50">
              Metal &amp; Bulk Supply
            </span>
          </span>
        </Link>

        {/* Omni-search */}
        <div className="relative mx-auto w-full max-w-2xl" ref={searchRef}>
          <div className={cn(
            "flex items-center gap-2 border bg-[#2B3035] px-4 transition-all duration-300",
            focused ? "border-[#FF6B00] shadow-[0_0_0_1px_#FF6B00,0_0_30px_rgba(255,107,0,0.15)]" : "border-[#3A3F44]"
          )}>
            <Search className="h-4 w-4 shrink-0 text-[#FF6B00]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Поиск: арматура, труба, песок, щебень..."
              className="h-11 w-full bg-transparent text-sm font-medium text-[#F4EBE1] placeholder:text-[#E6D5BC]/40 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-[#E6D5BC]/50 hover:text-[#F4EBE1]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick tags */}
          <div className="mt-2 hidden flex-wrap gap-1.5 md:flex">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="rounded-full border border-[#3A3F44] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E6D5BC]/60 transition-all hover:border-[#FF6B00] hover:text-[#FF6B00]"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Autocomplete */}
          {focused && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 border border-[#3A3F44] bg-[#1A1D20] shadow-2xl">
              {metalHits.length > 0 && (
                <div className="p-2">
                  <p className="px-2 pb-1.5 text-[9px] font-black uppercase tracking-widest text-[#FF9900]">
                    Найдено в металле
                  </p>
                  {metalHits.map((h) => (
                    <button
                      key={h.name}
                      type="button"
                      onClick={() => setQuery(h.name)}
                      className="flex w-full items-center justify-between rounded px-2 py-2 text-left transition-colors hover:bg-[#2B3035]"
                    >
                      <span className="text-sm font-semibold text-[#F4EBE1]">{h.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#E6D5BC]/40">{h.category}</span>
                    </button>
                  ))}
                </div>
              )}
              {sandHits.length > 0 && (
                <div className="border-t border-[#3A3F44] p-2">
                  <p className="px-2 pb-1.5 text-[9px] font-black uppercase tracking-widest text-[#E6D5BC]/70">
                    Найдено в песке и щебне
                  </p>
                  {sandHits.map((h) => (
                    <button
                      key={h.name}
                      type="button"
                      onClick={() => setQuery(h.name)}
                      className="flex w-full items-center justify-between rounded px-2 py-2 text-left transition-colors hover:bg-[#2B3035]"
                    >
                      <span className="text-sm font-semibold text-[#F4EBE1]">{h.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#E6D5BC]/40">{h.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact hub */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://wa.me/74951234567"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center border border-[#3A3F44] bg-[#2B3035] text-[#E6D5BC] transition-all hover:border-[#25D366] hover:text-[#25D366]"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href="https://t.me/pesokmetall"
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 w-10 items-center justify-center border border-[#3A3F44] bg-[#2B3035] text-[#E6D5BC] transition-all hover:border-[#229ED9] hover:text-[#229ED9] sm:flex"
            aria-label="Telegram"
          >
            <Send className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setCallOpen(true)}
            className="hidden h-10 items-center gap-2 border border-[#FF6B00] bg-[#FF6B00] px-4 text-xs font-black uppercase tracking-widest text-[#1A1D20] transition-all hover:bg-[#FF9900] active:scale-95 md:flex"
          >
            <Phone className="h-4 w-4" />
            +7 (495) 000-00-00
          </button>
        </div>
      </div>

      {/* Request call modal */}
      {callOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1D20]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border-2 border-[#FF6B00] bg-[#1A1D20] p-8 shadow-[0_0_60px_rgba(255,107,0,0.2)]">
            {callSent ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-[#FF6B00] text-2xl text-[#FF6B00]">
                  ✓
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#F4EBE1]">Заявка принята</h3>
                <p className="mt-2 text-sm text-[#E6D5BC]/70">
                  Менеджер перезвонит в течение 15 минут в рабочее время.
                </p>
                <button
                  type="button"
                  onClick={() => { setCallOpen(false); setCallSent(false); setPhone(""); }}
                  className="mt-6 h-12 w-full bg-[#FF6B00] text-sm font-black uppercase tracking-widest text-[#1A1D20] transition-colors hover:bg-[#FF9900]"
                >
                  Отлично
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#F4EBE1]">Обратный звонок</h3>
                  <button type="button" onClick={() => setCallOpen(false)} className="text-[#E6D5BC]/50 hover:text-[#F4EBE1]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  type="tel"
                  className="mb-4 h-12 w-full border border-[#3A3F44] bg-[#2B3035] px-4 text-sm font-semibold text-[#F4EBE1] placeholder:text-[#E6D5BC]/40 focus:border-[#FF6B00] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => phone.trim().length > 5 && setCallSent(true)}
                  disabled={phone.trim().length <= 5}
                  className="h-12 w-full bg-[#FF6B00] text-sm font-black uppercase tracking-widest text-[#1A1D20] transition-colors hover:bg-[#FF9900] disabled:opacity-40"
                >
                  Заказать звонок
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
