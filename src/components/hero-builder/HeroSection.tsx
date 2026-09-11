import Link from "next/link";
import type { ReactNode } from "react";
import {
  type HeroButtonElement,
  type HeroConfig,
  type HeroElement,
  type HeroBackground,
  paddingToStyle,
  spacingToStyle,
} from "./types";

function BackgroundLayer({ bg }: { bg: HeroBackground }) {
  if (bg.type === "video" && bg.videoUrl) {
    return (
      <video
        src={bg.videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  if (bg.type === "image" && bg.imageUrl) {
    return (
      <img
        src={bg.imageUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  if (bg.type === "gradient") {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${bg.gradientAngle}deg, ${bg.gradientFrom}, ${bg.gradientTo})`,
        }}
      />
    );
  }
  return (
    <div className="absolute inset-0" style={{ backgroundColor: bg.color }} />
  );
}

function CtaButton({ el }: { el: HeroButtonElement }) {
  const cls = `hero-cta-${el.id}`;
  return (
    <>
      <style>{`.${cls}{transition:transform .2s ease,background .2s ease,box-shadow .2s ease}.${cls}:hover{background:${el.hoverBgColor};transform:scale(${el.hoverScale});box-shadow:0 10px 30px -10px rgba(0,0,0,.45)}`}</style>
      <Link
        href={el.href || "#"}
        className={`inline-flex items-center justify-center px-6 py-3 leading-none ${cls}`}
        style={{
          backgroundColor: el.bgColor,
          color: el.textColor,
          borderRadius: el.borderRadius,
          fontSize: el.fontSize,
          fontWeight: el.fontWeight,
        }}
      >
        {el.text}
      </Link>
    </>
  );
}

function renderSingle(el: HeroElement, keyPrefix = ""): ReactNode {
  const margin = spacingToStyle(el.margin);
  const padding = paddingToStyle(el.padding);

  switch (el.type) {
    case "heading":
      return (
        <h1
          key={keyPrefix + el.id}
          style={{
            ...margin,
            ...padding,
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            color: el.color,
            textAlign: el.align,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          {el.text}
        </h1>
      );
    case "paragraph":
      return (
        <p
          key={keyPrefix + el.id}
          style={{
            ...margin,
            ...padding,
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            color: el.color,
            textAlign: el.align,
            lineHeight: 1.6,
          }}
        >
          {el.text}
        </p>
      );
    case "button":
      return (
        <div
          key={keyPrefix + el.id}
          style={{ ...margin, ...padding, textAlign: el.align }}
        >
          <CtaButton el={el} />
        </div>
      );
    case "media":
      return (
        <div
          key={keyPrefix + el.id}
          style={{
            ...margin,
            ...padding,
            width: `${el.width}%`,
            textAlign: el.align,
          }}
        >
          {el.mediaType === "video" && el.src ? (
            <video
              src={el.src}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: el.height,
                objectFit: el.objectFit,
                borderRadius: el.borderRadius,
              }}
            />
          ) : el.src ? (
            <img
              src={el.src}
              alt=""
              style={{
                width: "100%",
                height: el.height,
                objectFit: el.objectFit,
                borderRadius: el.borderRadius,
              }}
            />
          ) : null}
        </div>
      );
    default:
      return null;
  }
}

function renderList(elements: HeroElement[]): ReactNode[] {
  const out: ReactNode[] = [];
  let buttonRow: HeroButtonElement[] = [];

  const flush = () => {
    if (buttonRow.length > 0) {
      out.push(
        <div
          key={`btnrow-${out.length}`}
          className="flex flex-wrap gap-3"
          style={{ justifyContent: alignToJustify(buttonRow[0].align) }}
        >
          {buttonRow.map((b) => renderSingle(b))}
        </div>,
      );
      buttonRow = [];
    }
  };

  for (const el of elements) {
    if (el.type === "button") {
      buttonRow.push(el);
      continue;
    }
    flush();
    out.push(renderSingle(el));
  }
  flush();
  return out;
}

function alignToJustify(align: "left" | "center" | "right"): "flex-start" | "center" | "flex-end" {
  return align === "left" ? "flex-start" : align === "center" ? "center" : "flex-end";
}

export function HeroSection({ data }: { data: HeroConfig }) {
  const { background: bg } = data;

  const mediaEls = data.elements.filter((e) => e.type === "media");
  const contentEls = data.elements.filter((e) => e.type !== "media");
  const isSplit = data.layout === "split" || data.layout === "split-reverse";

  const contentCol = (
    <div className="flex min-w-0 flex-1 flex-col justify-center">
      {renderList(contentEls)}
    </div>
  );

  const mediaCol =
    mediaEls.length > 0 ? (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
        {renderList(mediaEls)}
      </div>
    ) : null;

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: data.minHeight }}
    >
      <BackgroundLayer bg={bg} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundColor: bg.overlayColor,
          opacity: bg.overlayOpacity / 100,
        }}
      />
      <div className="relative z-[2] mx-auto flex h-full w-full max-w-7xl items-center px-6 py-14">
        {isSplit ? (
          <div className="grid w-full items-center gap-10 md:grid-cols-2">
            {data.layout === "split" ? (
              <>
                {contentCol}
                {mediaCol}
              </>
            ) : (
              <>
                {mediaCol}
                {contentCol}
              </>
            )}
          </div>
        ) : (
          <div
            className={`flex w-full flex-col ${
              data.layout === "stacked-center"
                ? "items-center text-center"
                : "items-start"
            }`}
          >
            {renderList(data.elements)}
          </div>
        )}
      </div>
    </section>
  );
}
