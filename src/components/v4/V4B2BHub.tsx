"use client";

import { useRef, useState } from "react";
import { Building2, CheckCircle2, Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function V4B2BHub() {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    setUploaded(file.name);
  }

  return (
    <section id="b2b" className="border-b border-[#3A3F44] bg-[#1A1D20] py-20 text-[#F4EBE1]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Copy */}
          <div>
            <span className="mb-4 inline-flex items-center gap-2 border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#FF9900]">
              <Building2 className="h-3.5 w-3.5" />
              B2B Enterprise
            </span>
            <h2 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
              Для снабженцев и <span className="text-[#FF6B00]">прорабов</span>
            </h2>
            <p className="mt-5 max-w-lg text-base font-medium leading-relaxed text-[#E6D5BC]/70">
              Пришлите спецификацию — рассчитаем точную смету за 15 минут.
              Ежедневный прайс в Excel для закупок и тендеров.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Оптовые цены от 1 тонны и 10 м³",
                "Отсрочка платежа для постоянных клиентов",
                "Закрывающие документы: УПД, счёт-фактура",
                "Доставка по графику на объект",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-semibold text-[#F4EBE1]/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[#FF6B00] text-[10px] text-[#FF6B00]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/api/price-list"
              className="mt-10 inline-flex items-center gap-3 border-2 border-[#FF6B00] bg-[#FF6B00] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#1A1D20] transition-all hover:bg-[#FF9900] active:scale-95"
            >
              <Download className="h-4 w-4" />
              Скачать прайс (Excel)
            </a>
          </div>

          {/* Drag-drop zone */}
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex min-h-[320px] cursor-pointer flex-col items-center justify-center border-4 border-dashed p-10 text-center transition-all duration-300",
                dragging
                  ? "border-[#FF6B00] bg-[#FF6B00]/10 shadow-[0_0_60px_rgba(255,107,0,0.2)]"
                  : "border-[#3A3F44] bg-[#2B3035]/50 hover:border-[#FF6B00]/60"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xls,.xlsx,.pdf,.csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {uploaded ? (
                <>
                  <div className="mb-5 flex h-16 w-16 items-center justify-center border-2 border-green-500 text-green-500">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-green-400">
                    Спецификация загружена!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm font-semibold text-[#E6D5BC]/70">
                    {uploaded} — наш менеджер вернёт расчёт сметы в течение 15 минут.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploaded(null);
                    }}
                    className="mt-6 border border-[#3A3F44] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#E6D5BC]/70 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00]"
                  >
                    Загрузить другой файл
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-5 flex h-16 w-16 items-center justify-center border-2 border-[#FF6B00] text-[#FF6B00]">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Drop your estimation sheet
                  </h3>
                  <p className="mt-2 max-w-sm text-sm font-semibold text-[#E6D5BC]/60">
                    Перетащите сюда спецификацию (XLS, XLSX, PDF, CSV) или
                    нажмите для выбора файла
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 border border-[#3A3F44] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#E6D5BC]/70">
                    <FileSpreadsheet className="h-4 w-4 text-[#FF9900]" />
                    XLS · PDF · CSV
                  </span>
                </>
              )}
            </div>
            <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#E6D5BC]/40">
              Файлы не публикуются — только для расчёта сметы
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
