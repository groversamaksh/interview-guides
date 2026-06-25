import React, { ComponentPropsWithoutRef, ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import MermaidDiagram from "./MermaidDiagram";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div
      className={
        "prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 " +
        "prose-code:rounded-md prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm dark:prose-code:bg-zinc-800"
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeHighlight, { detect: true, ignoreMissing: true, plainText: ["mermaid"] }],
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: "anchor-link" },
            },
          ],
        ]}
        components={{
          pre: ({
            children,
          }: ComponentPropsWithoutRef<"pre">) => {
            const child = React.Children.only(
              children
            ) as ReactElement<{ className?: string; children?: string }>;
            if (child.props.className === "language-mermaid") {
              return (
                <MermaidDiagram content={String(child.props.children)} />
              );
            }
            return <pre>{children}</pre>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
