"use client";

import { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";

// Initialize once at module level
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidDiagramProps {
  content: string;
}

export default function MermaidDiagram({ content }: MermaidDiagramProps) {
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    mermaid
      .render(id.current, content)
      .then((result) => {
        if (!cancelled) setSvg(result.svg);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to render diagram"
          );
      });

    return () => {
      cancelled = true;
    };
  }, [content]);

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        <p className="mb-1 font-medium">Diagram render error</p>
        <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex h-32 animate-pulse items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="text-sm text-zinc-400">Rendering diagram…</span>
      </div>
    );
  }

  return (
    <div
      className="my-4 flex justify-center overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
