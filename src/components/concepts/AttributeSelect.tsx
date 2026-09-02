"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Анимированный кастомный селект (вместо стандартного <select>):
 * раскрывается с неоновой рамкой, закрывается по клику вне.
 * Используется для выбора атрибута (толщина, длина, зона доставки).
 */
export function AttributeSelect({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? options[0] ?? "");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (options.length === 0) return null;

  function pick(opt: string) {
    setSelected(opt);
    setOpen(false);
    onChange?.(opt);
  }

  return (
    <div className="attr-select" ref={rootRef}>
      {label && <span className="attr-select__label">{label}</span>}
      <button
        type="button"
        className={`attr-select__trigger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected}</span>
        <ChevronDown className="attr-select__chevron" />
      </button>
      {open && (
        <ul className="attr-select__menu" role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`attr-select__option ${opt === selected ? "is-selected" : ""}`}
                onClick={() => pick(opt)}
                role="option"
                aria-selected={opt === selected}
              >
                <span>{opt}</span>
                {opt === selected && <Check className="attr-select__check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
