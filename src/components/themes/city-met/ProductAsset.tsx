"use client";

/**
 * ProductAsset — «крисповое» промышленное превью товара.
 * Если у товара есть фото — показываем его на белом канвасе.
 * Иначе рисуем технический line-drawing SVG (чертёж сечения с размерными
 * линиями): уголок, труба, арматура, швеллер, лист, двутавр, мешок сыпучих.
 */
import Image from "next/image";
import type { ReactElement } from "react";
import type { CityMetRow } from "./catalog-data";

export type AssetVariant =
  | "angle"
  | "pipe"
  | "rebar"
  | "channel"
  | "sheet"
  | "beam"
  | "bag";

/** Определить тип чертежа по названию/категории товара */
export function resolveAssetVariant(row: CityMetRow): AssetVariant {
  if (row.kind === "bulk") return "bag";
  const n = `${row.name} ${row.subcategory} ${row.category}`.toLowerCase();
  if (n.includes("уголок")) return "angle";
  if (n.includes("швеллер")) return "channel";
  if (n.includes("арматура")) return "rebar";
  if (n.includes("лист")) return "sheet";
  if (n.includes("труба")) return "pipe";
  if (n.includes("двутавр") || n.includes("балка")) return "beam";
  return "beam";
}

/** Размерная линия с стрелками */
function DimLine({
  x1,
  y1,
  x2,
  y2,
  label,
  offset = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  offset?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const ax = -uy;
  const ay = ux;
  const mx = (x1 + x2) / 2 + ax * offset;
  const my = (y1 + y2) / 2 + ay * offset;
  const s1x = x1 + ax * offset;
  const s1y = y1 + ay * offset;
  const s2x = x2 + ax * offset;
  const s2y = y2 + ay * offset;
  const arrow = 5;
  return (
    <g>
      <line
        x1={s1x}
        y1={s1y}
        x2={s2x}
        y2={s2y}
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line x1={s1x} y1={s1y} x2={s1x - ux * arrow + ax * 2} y2={s1y - uy * arrow + ay * 2} stroke="#94a3b8" strokeWidth="1" />
      <line x1={s1x} y1={s1y} x2={s1x - ux * arrow - ax * 2} y2={s1y - uy * arrow - ay * 2} stroke="#94a3b8" strokeWidth="1" />
      <line x1={s2x} y1={s2y} x2={s2x + ux * arrow + ax * 2} y2={s2y + uy * arrow + ay * 2} stroke="#94a3b8" strokeWidth="1" />
      <line x1={s2x} y1={s2y} x2={s2x + ux * arrow - ax * 2} y2={s2y + uy * arrow - ay * 2} stroke="#94a3b8" strokeWidth="1" />
      {label && (
        <text
          x={mx}
          y={my}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fontWeight="700"
          fill="#64748b"
          style={{ background: "#fff" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Уголок равнополочный — L-сечение */
function AngleDrawing() {
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label="Чертёж уголка">
      <g stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 108 L32 32 L108 32" />
        <path d="M32 108 L32 32 L108 32" transform="translate(6 6)" opacity="0.25" />
      </g>
      <DimLine x1={32} y1={108} x2={108} y2={108} label="B" offset={-14} />
      <DimLine x1={32} y1={32} x2={32} y2={108} label="B" offset={-14} />
      <DimLine x1={32} y1={32} x2={108} y2={32} label="t" offset={-14} />
      <line x1={32} y1={32} x2={70} y2={70} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

/** Труба — концентрические окружности с диаметром */
function PipeDrawing() {
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label="Чертёж трубы">
      <circle cx="70" cy="70" r="40" fill="none" stroke="#1f2937" strokeWidth="3" />
      <circle cx="70" cy="70" r="26" fill="none" stroke="#1f2937" strokeWidth="3" />
      <line x1="70" y1="30" x2="70" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="30" y1="70" x2="110" y2="70" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
      <DimLine x1={30} y1={70} x2={110} y2={70} label="D" offset={-16} />
      <DimLine x1={44} y1={70} x2={96} y2={70} label="d" offset={16} />
    </svg>
  );
}

/** Арматура — стержень с рифлением */
function RebarDrawing() {
  const ribs = Array.from({ length: 9 }, (_, i) => 30 + i * 9);
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label="Чертёж арматуры">
      <g stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round">
        <line x1="20" y1="70" x2="120" y2="70" />
        <circle cx="70" cy="70" r="9" fill="none" strokeWidth="2" />
      </g>
      {ribs.map((x) => (
        <g key={x} stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round">
          <line x1={x} y1="58" x2={x + 4} y2="82" />
          <line x1={x + 4} y1="58" x2={x + 8} y2="82" />
        </g>
      ))}
      <DimLine x1={20} y1={70} x2={120} y2={70} label="L" offset={-18} />
      <DimLine x1={61} y1={70} x2={79} y2={70} label="d" offset={18} />
    </svg>
  );
}

/** Швеллер — U-сечение */
function ChannelDrawing() {
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label="Чертёж швеллера">
      <g stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M38 30 L38 110 L102 110" />
        <path d="M38 30 L102 30 L102 110" transform="translate(0 0)" opacity="0.15" />
      </g>
      <DimLine x1={38} y1={30} x2={38} y2={110} label="h" offset={-16} />
      <DimLine x1={38} y1={110} x2={102} y2={110} label="b" offset={-14} />
      <line x1={38} y1={30} x2={38} y2={110} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 3" opacity="0" />
    </svg>
  );
}

/** Лист — прямоугольник с толщиной */
function SheetDrawing() {
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label="Чертёж листа">
      <rect x="25" y="55" width="90" height="30" fill="none" stroke="#1f2937" strokeWidth="3" />
      <line x1="25" y1="70" x2="115" y2="70" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
      <DimLine x1={25} y1={55} x2={115} y2={55} label="L" offset={-14} />
      <DimLine x1={115} y1={55} x2={115} y2={85} label="t" offset={14} />
    </svg>
  );
}

/** Двутавр — H-сечение */
function BeamDrawing() {
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label="Чертёж двутавра">
      <g stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 38 L110 38 L110 50 L78 50 L78 90 L110 90 L110 102 L30 102 L30 90 L62 90 L62 50 L30 50 Z" />
      </g>
      <DimLine x1={30} y1={38} x2={110} y2={38} label="b" offset={-14} />
      <DimLine x1={30} y1={38} x2={30} y2={102} label="h" offset={-14} />
      <line x1={70} y1={38} x2={70} y2={102} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

/** Мешок сыпучих — с текстурой и маркировкой */
function BagDrawing() {
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label="Мешок сыпучего материала">
      <g fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 30 L95 30 L92 112 L48 112 Z" />
        <path d="M45 30 C45 18 95 18 95 30" />
      </g>
      <g fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1">
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={52 + (i % 5) * 9} cy={48 + Math.floor(i / 5) * 16} r="2.5" />
        ))}
      </g>
      <text x="70" y="100" textAnchor="middle" fontSize="9" fontWeight="800" fill="#334155">
        50 КГ
      </text>
      <DimLine x1={45} y1={30} x2={95} y2={30} label="мешок" offset={-14} />
    </svg>
  );
}

const DRAWINGS: Record<AssetVariant, () => ReactElement> = {
  angle: AngleDrawing,
  pipe: PipeDrawing,
  rebar: RebarDrawing,
  channel: ChannelDrawing,
  sheet: SheetDrawing,
  beam: BeamDrawing,
  bag: BagDrawing,
};

interface ProductAssetProps {
  row: CityMetRow;
  className?: string;
}

export default function ProductAsset({ row, className }: ProductAssetProps) {
  const Drawing = DRAWINGS[resolveAssetVariant(row)];

  if (row.imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-white ${className ?? ""}`}>
        <Image
          src={row.imageUrl}
          alt={row.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-contain p-2"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-white ${className ?? ""}`}>
      <div className="h-full w-full p-2">
        <Drawing />
      </div>
    </div>
  );
}
