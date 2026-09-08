import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Home, Search, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 text-8xl font-black tracking-tighter text-slate-900">
            404
          </div>
          <h1 className="mb-4 text-2xl font-bold text-slate-900">
            Страница не найдена
          </h1>
          <p className="mb-8 text-slate-500">
            Возможно, страница была перемещена или удалена. Воспользуйтесь
            навигацией или вернитесь на главную.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              <Home className="h-4 w-4" />
              На главную
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
              Каталог
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" />
              Контакты
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
