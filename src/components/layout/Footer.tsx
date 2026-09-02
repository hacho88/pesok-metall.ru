import { MOSCOW_DISTRICTS, MO_CITIES } from "@/lib/geo-zones";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-400">
      {/* Geo Link Matrix */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-lg font-black text-white">
              pesok<span className="text-primary">-metall</span>.ru
            </h3>
            <p className="text-sm leading-relaxed">
              Металлопрокат, песок и щебень с доставкой по Москве и Московской
              области в день заказа. Розница и опт. Соответствие ГОСТ.
            </p>
            <p className="mt-4 text-xs font-bold text-slate-500">
              Работаем ежедневно с 8:00 до 22:00
            </p>
          </div>

          {/* Moscow Districts */}
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
              Районы Москвы
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {MOSCOW_DISTRICTS.map((zone) => (
                <a
                  key={zone.slug}
                  href={`/geo/${zone.slug}`}
                  className="text-sm transition-colors hover:text-primary"
                >
                  {zone.name}
                </a>
              ))}
            </div>
          </div>

          {/* MO Cities */}
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
              Города Московской области
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {MO_CITIES.map((zone) => (
                <a
                  key={zone.slug}
                  href={`/geo/${zone.slug}`}
                  className="text-sm transition-colors hover:text-primary"
                >
                  {zone.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} pesok-metall.ru — металлопрокат и сыпучие
            материалы с доставкой по Москве и МО
          </p>
          <nav className="flex flex-wrap items-center gap-4">
            <a href="/metall" className="transition-colors hover:text-white">Металлопрокат</a>
            <a href="/pesok-scheben" className="transition-colors hover:text-white">Песок и щебень</a>
            <a href="/blog" className="transition-colors hover:text-white">Блог</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
