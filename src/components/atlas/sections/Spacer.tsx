"use client";

import type { SectionComponentProps } from "./index";

export function Spacer({ props }: SectionComponentProps) {
  const height = (props.height as number) ?? 40;
  return <div style={{ height }} />;
}
