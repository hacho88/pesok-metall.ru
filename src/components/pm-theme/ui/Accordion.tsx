'use client'

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/pm-utils'

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root className={cn('flex flex-col gap-3', className)} {...props} />
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        'overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-slate-200/50',
        className,
      )}
      {...props}
    />
  )
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-5 shrink-0 text-primary transition-transform duration-200 group-data-[panel-open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionPanel({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      className={cn(
        'h-[var(--accordion-panel-height)] overflow-hidden text-sm leading-relaxed text-muted-foreground transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0',
        className,
      )}
      {...props}
    >
      <div className="px-5 pb-5 pt-0">{children}</div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel }
