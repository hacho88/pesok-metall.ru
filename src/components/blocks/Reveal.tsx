"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Плавное появление блока при попадании во вьюпорт.
 * Классы .block-reveal (minimal) и .block-fade (editorial) описаны
 * в стилевом движке; для bento/commerce блок виден сразу.
 */
export function Reveal({
  children,
  className = "block-reveal block-fade",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className}${visible ? " is-visible" : ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
