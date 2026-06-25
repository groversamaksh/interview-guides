import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  getAllSlugs,
  getDocBySlug,
  getDocsTree,
  getBreadcrumbs,
} from "@/lib/docs";
import Sidebar from "@/components/Sidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import MarkdownContent from "@/components/MarkdownContent";
import MobileSidebarToggle from "./MobileSidebarToggle";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return { title: "Not Found" };

  return {
    title: doc.title,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const tree = getDocsTree();
  const breadcrumbs = getBreadcrumbs(slug);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — fixed, independently scrollable */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50/50 lg:flex dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
          >
            Interview Guides
          </Link>
        </div>
        <Sidebar tree={tree} />
      </aside>

      {/* Mobile sidebar */}
      <MobileSidebarToggle tree={tree} />

      {/* Main content — offset left for fixed sidebar on desktop */}
      <main className="min-h-screen min-w-0 lg:pl-64">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 lg:px-12">
          <Breadcrumbs items={breadcrumbs} />
          <article>
            <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              {doc.title}
            </h1>
            <MarkdownContent content={doc.content} />
          </article>

          {/* Footer nav */}
          <footer className="mt-16 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <div className="flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span>
                Found an error or want to contribute? Edit the source file in{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  docs/{slug.join("/")}.md
                </code>
                .
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
