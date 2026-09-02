import type { ReactNode } from "react";
import type { ThemeConcept } from "@/lib/theme-concepts";

/**
 * Корневая оболочка витрины: применяет класс концепции,
 * шрифты заголовков/текста и базовый радиус скругления.
 */
export function ConceptShell({
  concept,
  children,
}: {
  concept: ThemeConcept;
  children: ReactNode;
}) {
  return <div className={`concept concept-${concept}`}>{children}</div>;
}
