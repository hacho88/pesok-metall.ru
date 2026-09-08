"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Home, RefreshCw, Phone } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 text-8xl font-black tracking-tighter text-slate-900">
            500
          </div>
          <h1 className="mb-4 text-2xl font-bold text-slate-900">
            Что-то пошло не так
          </h1>
          <p className="mb-8 text-slate-500">
            Произошла ошибка на сервере. Попробуйте обновить страницу или
            вернитесь позже. Мы уже работаем над исправлением.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Повторить
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              На главную
            </Link>
            <a
              href="tel:+74950000000"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" />
              Позвонить
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
