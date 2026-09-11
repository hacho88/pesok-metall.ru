"use client";

import { useEffect, useState } from "react";
import { HeroAdmin } from "@/components/hero-builder/HeroAdmin";
import { HeroSection } from "@/components/hero-builder/HeroSection";
import {
  DEFAULT_HERO_CONFIG,
  normalizeHeroConfig,
  type HeroConfig,
} from "@/components/hero-builder/types";

export default function HeroBuilderPage() {
  const [config, setConfig] = useState<HeroConfig>(DEFAULT_HERO_CONFIG);

  useEffect(() => {
    fetch("/api/admin/hero-config")
      .then((r) => r.json())
      .then((d) => {
        if (d?.config) setConfig(normalizeHeroConfig(d.config));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <HeroAdmin config={config} setConfig={setConfig} />
      <div className="flex-1 overflow-y-auto bg-slate-200/60 p-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10">
          <HeroSection data={config} />
        </div>
        <p className="mt-4 text-center text-xs font-semibold text-slate-500">
          Живое превью — изменения применяются мгновенно
        </p>
      </div>
    </div>
  );
}
