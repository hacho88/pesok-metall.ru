import Link from "next/link";
import { ArrowRight, Hammer, Truck } from "lucide-react";

export function V4Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#3A3F44] bg-[#1A1D20] text-[#F4EBE1]">
      {/* Grain/noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Split-screen: metal left, sand right */}
      <div className="relative mx-auto grid max-w-[1440px] lg:grid-cols-2">
        {/* Metal side */}
        <div className="relative flex flex-col justify-center border-b border-[#3A3F44] px-6 py-16 sm:px-10 lg:border-b-0 lg:border-r lg:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,107,0,0.08) 0%, transparent 40%), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 6px)",
            }}
          />
          <div className="relative z-10 max-w-xl">
            <span className="mb-6 inline-flex items-center gap-2 border border-[#3A3F44] bg-[#2B3035] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#FF9900]">
              <Hammer className="h-3.5 w-3.5" />
              Metal Division
            </span>
            <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Metal &amp; Bulk
              <span className="block text-[#FF6B00]">Materials</span>
              <span className="block text-[#E6D5BC]">Same-Day</span>
              Delivery
            </h1>
            <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-[#E6D5BC]/70">
              Арматура, трубы, листы и сетка со склада + песок, щебень и грунт
              в мешках и биг-бегах. Розница и опт по Москве и МО.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/metall"
                className="group flex items-center gap-3 border-2 border-[#FF6B00] bg-[#FF6B00] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#1A1D20] shadow-[0_0_40px_rgba(255,107,0,0.25)] transition-all hover:bg-[#FF9900] active:scale-95"
              >
                Каталог металла
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/#calculator"
                className="flex items-center gap-3 border-2 border-[#3A3F44] bg-[#2B3035] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#F4EBE1] transition-all hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-95"
              >
                Рассчитать доставку
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-widest text-[#E6D5BC]/50">
              <span>ГОСТ 5781-82</span>
              <span>ГОСТ 8732-78</span>
              <span>ГОСТ 8267-93</span>
            </div>
          </div>
        </div>

        {/* Sand side */}
        <div className="relative flex flex-col justify-center px-6 py-16 sm:px-10 lg:py-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, #F4EBE1 0%, #E6D5BC 55%, #D3C2A3 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative z-10 max-w-xl">
            <span className="mb-6 inline-flex items-center gap-2 border border-[#D3C2A3] bg-[#F4EBE1]/60 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#1A1D20]">
              <Truck className="h-3.5 w-3.5" />
              Sand &amp; Aggregates
            </span>
            <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-[#1A1D20] sm:text-5xl lg:text-6xl">
              Песок, щебень
              <span className="block text-[#FF6B00]">и грунт</span>
              <span className="block">в день заказа</span>
            </h2>
            <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-[#1A1D20]/70">
              Мешки 30 кг для розницы, биг-беги 1 т и самосвалы для опта.
              Собственный автопарк: Газель, КАМАЗ, манипулятор.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/pesok-scheben"
                className="group flex items-center gap-3 border-2 border-[#1A1D20] bg-[#1A1D20] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#F4EBE1] transition-all hover:bg-[#2B3035] active:scale-95"
              >
                Песок и щебень
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/#calculator"
                className="flex items-center gap-3 border-2 border-[#1A1D20]/30 px-8 py-4 text-sm font-black uppercase tracking-widest text-[#1A1D20] transition-all hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-95"
              >
                Калькулятор объёма
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-widest text-[#1A1D20]/50">
              <span>Фасовка 30 кг</span>
              <span>Биг-бег 1 т</span>
              <span>Самосвал 20 т</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="relative border-t border-[#3A3F44] bg-[#2B3035] py-3">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_30s_linear_infinite] inline-flex gap-12 text-[11px] font-black uppercase tracking-[0.25em] text-[#E6D5BC]/60">
            {[0, 1].map((i) => (
              <span key={i} className="inline-flex gap-12">
                <span>Доставка в день заказа</span>
                <span className="text-[#FF6B00]">◆</span>
                <span>Соответствие ГОСТ</span>
                <span className="text-[#FF6B00]">◆</span>
                <span>Розница и опт</span>
                <span className="text-[#FF6B00]">◆</span>
                <span>Москва и Московская область</span>
                <span className="text-[#FF6B00]">◆</span>
                <span>Собственный автопарк</span>
                <span className="text-[#FF6B00]">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
