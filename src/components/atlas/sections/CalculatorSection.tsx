"use client";

import { useState } from "react";
import { Calculator as CalcIcon, Truck } from "lucide-react";
import type { SectionComponentProps } from "./index";
import { calculateBulkMaterials, assignOptimalVehicle, estimateDeliveryCost, formatRubles, formatNumber } from "@/lib/calculator";

interface FleetVehicle { id: string; name: string; maxWeightKg: any; maxLengthMeters: any; baseFare: any; perKmCharge: any; isActive: boolean; }

export function CalculatorSection({ props, data }: SectionComponentProps) {
  const resolved = data as { fleet: FleetVehicle[] } | null;
  const fleet = resolved?.fleet ?? [];
  const title = (props.title as string) ?? "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ РјР°С‚РµСЂРёР°Р»РѕРІ Рё РґРѕСЃС‚Р°РІРєРё";

  const [mode, setMode] = useState<"bulk" | "metal">("bulk");
  const [area, setArea] = useState("");
  const [thickness, setThickness] = useState("10");
  const [density, setDensity] = useState("1600");
  const [distance, setDistance] = useState("20");

  const [length, setLength] = useState("");
  const [weightPerM, setWeightPerM] = useState("");

  const bulk = mode === "bulk" && area && thickness && density
    ? calculateBulkMaterials(Number(area), Number(thickness), Number(density))
    : null;
  const vehicle = bulk ? assignOptimalVehicle(bulk.totalWeightKg, 6, fleet) : null;
  const delivery = vehicle ? estimateDeliveryCost(vehicle, Number(distance)) : 0;

  const metalWeight = mode === "metal" && length && weightPerM ? Number(length) * Number(weightPerM) : 0;
  const metalVehicle = metalWeight > 0 ? assignOptimalVehicle(metalWeight, 6, fleet) : null;
  const metalDelivery = metalVehicle ? estimateDeliveryCost(metalVehicle, Number(distance)) : 0;

  return (
    <div className="atlas-card atlas-card-elevated p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--atlas-font-heading)" }}>
        <CalcIcon size={24} style={{ color: "var(--atlas-primary)" }} />
        {title}
      </h2>

      <div className="flex gap-2 mb-4">
        <button className={`atlas-btn atlas-btn-sm ${mode === "bulk" ? "atlas-btn-primary" : "atlas-btn-secondary"}`} onClick={() => setMode("bulk")}>
          РЎС‹РїСѓС‡РёРµ
        </button>
        <button className={`atlas-btn atlas-btn-sm ${mode === "metal" ? "atlas-btn-primary" : "atlas-btn-secondary"}`} onClick={() => setMode("metal")}>
          РњРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚
        </button>
      </div>

      {mode === "bulk" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <label className="block">
            <span className="text-sm font-medium block mb-1">РџР»РѕС‰Р°РґСЊ, РјВІ</span>
            <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="atlas-input" placeholder="100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium block mb-1">РўРѕР»С‰РёРЅР°, СЃРј</span>
            <input type="number" value={thickness} onChange={(e) => setThickness(e.target.value)} className="atlas-input" />
          </label>
          <label className="block">
            <span className="text-sm font-medium block mb-1">РџР»РѕС‚РЅРѕСЃС‚СЊ, РєРі/РјВі</span>
            <input type="number" value={density} onChange={(e) => setDensity(e.target.value)} className="atlas-input" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-sm font-medium block mb-1">Р”Р»РёРЅР°, Рј</span>
            <input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="atlas-input" placeholder="100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium block mb-1">Р’РµСЃ РјРµС‚СЂР°, РєРі</span>
            <input type="number" value={weightPerM} onChange={(e) => setWeightPerM(e.target.value)} className="atlas-input" placeholder="0.888" />
          </label>
        </div>
      )}

      <label className="block mb-4 max-w-xs">
        <span className="text-sm font-medium block mb-1">Р Р°СЃСЃС‚РѕСЏРЅРёРµ РѕС‚ РњРљРђР”, РєРј</span>
        <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="atlas-input" />
      </label>

      {bulk && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg" style={{ background: "var(--atlas-surface-2)" }}>
          <Stat label="РћР±СЉС‘Рј" value={`${formatNumber(bulk.volumeM3, 2)} РјВі`} />
          <Stat label="Р’РµСЃ" value={`${formatNumber(bulk.totalWeightKg, 0)} РєРі`} />
          <Stat label="РњРµС€РєРё 30 РєРі" value={`${bulk.bags30kg} С€С‚`} />
          <Stat label="Р‘РёРі-Р±РµРіРё 1 С‚" value={`${bulk.bigBags1Ton} С€С‚`} />
        </div>
      )}

      {metalWeight > 0 && (
        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg" style={{ background: "var(--atlas-surface-2)" }}>
          <Stat label="РћР±С‰РёР№ РІРµСЃ" value={`${formatNumber(metalWeight, 0)} РєРі`} />
          <Stat label="РўРѕРЅРЅ" value={`${formatNumber(metalWeight / 1000, 2)} С‚`} />
        </div>
      )}

      {(vehicle || metalVehicle) && (
        <div className="mt-3 p-4 rounded-lg flex items-center gap-3" style={{ background: "color-mix(in srgb, var(--atlas-primary) 8%, transparent)" }}>
          <Truck size={24} style={{ color: "var(--atlas-primary)" }} />
          <div>
            <div className="font-semibold text-sm">{(vehicle ?? metalVehicle)?.name}</div>
            <div className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>
              Р”РѕСЃС‚Р°РІРєР°: РѕС‚ {formatRubles(vehicle ? delivery : metalDelivery)} в‚Ѕ
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{label}</div>
      <div className="font-bold text-lg" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
