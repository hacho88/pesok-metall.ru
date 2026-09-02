"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqBlock } from "@/types/page-builder";

export function Faq({ title, items }: FaqBlock) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="block-section mx-auto max-w-4xl py-16">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          Вопросы и ответы
        </span>
        <h2 className="font-jakarta text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
      </div>
      
      <div className="space-y-4">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={cn(
                "group rounded-2xl border bg-card transition-all duration-300",
                isOpen ? "border-primary/50 ring-4 ring-primary/5 shadow-xl" : "hover:border-primary/30"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-6 p-6 text-left"
              >
                <span className={cn(
                  "font-jakarta text-lg font-bold tracking-tight transition-colors",
                  isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                )}>
                  {item.question}
                </span>
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  isOpen ? "bg-primary border-primary text-white rotate-180" : "bg-muted/50 border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0">
                    <div className="h-px w-full bg-gradient-to-r from-border via-border to-transparent mb-6" />
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
