import Link from "next/link";
import { Building2, FileText, MessageCircle, Send } from "lucide-react";

export function CorporateBanner() {
  return (
    <section id="b2b" className="bg-white py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                Для бизнеса и юр. лиц
              </span>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Счета с НДС 20% — <span className="text-amber-400">автоматически</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-white/70">
                Сформируйте счёт на оплату онлайн за 30 секунд: с НДС 20% для
                юр. лиц или без НДС для ИП на УСН. Закрывающие документы — УПД,
                счёт-фактура, товарная накладная.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/#invoice"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-black uppercase tracking-widest text-slate-900 transition-all hover:scale-105 hover:bg-amber-300 active:scale-95"
                >
                  <FileText className="h-4 w-4" />
                  Сформировать счёт
                </Link>
                <a
                  href="https://wa.me/74951234567"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-colors hover:border-green-400 hover:text-green-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp для бизнеса
                </a>
                <a
                  href="https://t.me/pesokmetall_b2b"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-colors hover:border-sky-400 hover:text-sky-400"
                >
                  <Send className="h-4 w-4" />
                  Telegram-канал
                </a>
              </div>
            </div>

            {/* VAT card */}
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Пример счёта
              </p>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Товары</span>
                  <span className="font-black">120 000 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">НДС 20%</span>
                  <span className="font-black text-amber-400">24 000 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Доставка</span>
                  <span className="font-black">3 400 ₽</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="font-black uppercase tracking-widest">Итого</span>
                    <span className="text-xl font-black text-amber-400">147 400 ₽</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-green-500/15 py-3 text-xs font-black uppercase tracking-widest text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                Счёт готов к оплате
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
