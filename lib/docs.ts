import fs from "fs";
import path from "path";
import { formatLabel } from "./utils";
import type { DocNode, Breadcrumb } from "./types";

const DOCS_DIR = path.join(process.cwd(), "docs");

/**
 * Walk the docs/ directory and return a tree of DocNodes.
 * Folders come first, then files, both sorted alphabetically.
 */
export function getDocsTree(
  basePath: string = DOCS_DIR,
  parentSlug: string[] = []
): DocNode[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(basePath, { withFileTypes: true });
  } catch {
    return [];
  }

  const nodes: DocNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(basePath, entry.name);
    const segment = entry.name.replace(/\.md$/, "");

    if (entry.isDirectory()) {
      const children = getDocsTree(fullPath, [...parentSlug, segment]);
      if (children.length > 0) {
        nodes.push({
          name: segment,
          slug: "/" + [...parentSlug, segment].join("/"),
          type: "folder",
          children,
        });
      }
    } else if (entry.name.endsWith(".md")) {
      nodes.push({
        name: segment,
        slug: "/" + [...parentSlug, segment].join("/"),
        type: "file",
      });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

/**
 * Return all slug arrays for every .md file in docs/.
 * Used by generateStaticParams.
 */
export function getAllSlugs(): string[][] {
  const slugs: string[][] = [];

  function walk(dir: string, current: string[]) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, [...current, entry.name]);
      } else if (entry.name.endsWith(".md")) {
        slugs.push([...current, entry.name.replace(/\.md$/, "")]);
      }
    }
  }

  walk(DOCS_DIR, []);
  return slugs;
}

/**
 * Read a markdown file by its slug segments.
 * e.g. getDocBySlug(["react_guide", "03_Hooks"]) reads docs/react_guide/03_Hooks.md
 */
export function getDocBySlug(
  slug: string[]
): { content: string; title: string } | null {
  const filePath = path.join(DOCS_DIR, ...slug) + ".md";
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");

  // Extract title from first h1, or fall back to formatted filename
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch
    ? titleMatch[1]
    : formatLabel(slug[slug.length - 1]);

  return { content: raw, title };
}

/**
 * Build a breadcrumb trail from the current slug segments.
 * Always starts with "Home".
 */
export function getBreadcrumbs(slug: string[]): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Home", href: "/" }];

  let accumulated = "";
  for (const segment of slug) {
    accumulated += "/" + segment;
    crumbs.push({
      label: formatLabel(segment),
      href: accumulated,
    });
  }

  return crumbs;
}
