"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { DocNode } from "@/lib/types";
import { formatLabel } from "@/lib/utils";

interface SidebarProps {
  tree: DocNode[];
  onNavigate?: () => void;
}

function SidebarItem({
  node,
  activePath,
  expandedFolders,
  toggleFolder,
  onNavigate,
  depth = 0,
}: {
  node: DocNode;
  activePath: string;
  expandedFolders: Set<string>;
  toggleFolder: (slug: string) => void;
  onNavigate?: () => void;
  depth?: number;
}) {
  const isActive = node.type === "file" && node.slug === activePath;
  const isExpanded = expandedFolders.has(node.slug);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => toggleFolder(node.slug)}
          className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
            depth === 0
              ? "font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <svg
            className={`h-3 w-3 shrink-0 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          {formatLabel(node.name)}
        </button>
        {isExpanded && (
          <div className="ml-3 mt-0.5 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-700">
            {node.children!.map((child) => (
              <SidebarItem
                key={child.slug}
                node={child}
                activePath={activePath}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={node.slug}
      onClick={onNavigate}
      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
        depth > 0 ? "ml-4" : ""
      } ${
        isActive
          ? "bg-zinc-800 font-medium text-white dark:bg-white dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
    >
      {formatLabel(node.name)}
    </Link>
  );
}

export default function Sidebar({ tree, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("sidebar-expanded");
        if (saved) return new Set(JSON.parse(saved));
      } catch {}
    }
    return new Set<string>();
  });

  // Auto-expand folders containing the active page
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);

    setExpandedFolders((prev) => {
      const next = new Set(prev);
      let accumulated = "";
      for (const seg of segments) {
        accumulated += "/" + seg;
        next.add(accumulated);
      }
      return next;
    });
  }, [pathname]);

  // Persist expanded state
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "sidebar-expanded",
        JSON.stringify([...expandedFolders])
      );
    } catch {}
  }, [expandedFolders]);

  const toggleFolder = useCallback((slug: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <div className="space-y-1">
        {tree.map((node) => (
          <SidebarItem
            key={node.slug}
            node={node}
            activePath={pathname}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}
