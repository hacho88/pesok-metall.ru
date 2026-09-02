"use client";

import { useState, useMemo } from "react";
import { ChevronRight, Search, Download, type LucideIcon } from "lucide-react";
import type { AtlasCategoryNode } from "@/lib/atlas/catalog";
import type { AtlasSidebar } from "@/lib/atlas/config-schema";

const TYPE_ICONS: Record<string, string> = {
  METALL: "Layers",
  BULK: "Package",
  MIXED: "Boxes",
};

export function AtlasCategoryTree({
  tree,
  config,
  activeSlug,
}: {
  tree: AtlasCategoryNode[];
  config: AtlasSidebar;
  activeSlug?: string;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query.trim()) return tree;
    const q = query.toLowerCase();
    const filterNode = (nodes: AtlasCategoryNode[]): AtlasCategoryNode[] =>
      nodes
        .map((n) => {
          const children = filterNode(n.children);
          if (n.name.toLowerCase().includes(q) || children.length > 0) {
            return { ...n, children };
          }
          return null;
        })
        .filter((n): n is AtlasCategoryNode => n !== null);
    return filterNode(tree);
  }, [tree, query]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Auto-expand active path
  const activePath = useMemo(() => findPath(tree, activeSlug), [tree, activeSlug]);
  const effectiveExpanded = useMemo(() => {
    const s = new Set(expanded);
    for (const id of activePath) s.add(id);
    return s;
  }, [expanded, activePath]);

  return (
    <div className="atlas-card atlas-card-elevated p-3 sticky" style={{ top: "calc(var(--atlas-header-h, 152px) + 16px)", maxHeight: "calc(100vh - var(--atlas-header-h, 152px) - 32px)", overflowY: "auto" }} >
      {config.showSearch && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--atlas-text-muted)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти в каталоге"
            className="atlas-input text-sm pl-8"
            style={{ height: 36 }}
          />
        </div>
      )}

      {config.groups && (
        <div className="mb-2">
          <GroupLabel>Металлопрокат</GroupLabel>
        </div>
      )}

      <div role="tree" className="space-y-0.5">
        {filtered.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            expanded={effectiveExpanded}
            onToggle={toggle}
            activeSlug={activeSlug}
            showCounts={config.showCounts}
            depth={0}
          />
        ))}
      </div>

      {config.promoCard.enabled && (
        <a
          href={config.promoCard.href}
          className="mt-4 block p-4 rounded-lg transition-colors"
          style={{ background: "var(--atlas-surface-2)" }}
        >
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            <Download size={18} style={{ color: "var(--atlas-primary)" }} />
            {config.promoCard.title}
          </div>
          <p className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>
            {config.promoCard.text}
          </p>
        </a>
      )}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-xs font-semibold uppercase tracking-wider px-2 py-1"
      style={{ color: "var(--atlas-text-muted)" }}
    >
      {children}
    </div>
  );
}

function TreeItem({
  node,
  expanded,
  onToggle,
  activeSlug,
  showCounts,
  depth,
}: {
  node: AtlasCategoryNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  activeSlug?: string;
  showCounts: boolean;
  depth: number;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isActive = node.slug === activeSlug;

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className="flex items-center gap-1 rounded-lg transition-colors group"
        style={{
          paddingLeft: 12 + depth * 16,
          paddingRight: 12,
          height: 40,
          background: isActive ? "color-mix(in srgb, var(--atlas-primary) 8%, transparent)" : "transparent",
          borderLeft: isActive ? "3px solid var(--atlas-primary)" : "3px solid transparent",
        }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="flex items-center justify-center w-5 h-5 shrink-0 rounded transition-transform"
            style={{ color: "var(--atlas-text-muted)" }}
          >
            <ChevronRight
              size={16}
              style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <a
          href={`/catalog/${encodeURIComponent(node.slug)}`}
          className="flex-1 text-sm font-medium truncate transition-colors"
          style={{
            color: isActive ? "var(--atlas-primary)" : "var(--atlas-text)",
            fontWeight: isActive ? 600 : 500,
          }}
        >
          {node.name}
        </a>
        {showCounts && (
          <span className="text-xs shrink-0" style={{ color: "var(--atlas-text-muted)" }}>
            {node.totalProductCount}
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div role="group">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              activeSlug={activeSlug}
              showCounts={showCounts}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function findPath(tree: AtlasCategoryNode[], slug?: string): string[] {
  if (!slug) return [];
  const search = (nodes: AtlasCategoryNode[], path: string[]): string[] | null => {
    for (const n of nodes) {
      if (n.slug === slug) return [...path, n.id];
      const found = search(n.children, [...path, n.id]);
      if (found) return found;
    }
    return null;
  };
  return search(tree, []) ?? [];
}
