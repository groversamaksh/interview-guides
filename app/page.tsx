import Link from "next/link";
import { getDocsTree } from "@/lib/docs";
import { formatLabel } from "@/lib/utils";

export default function Home() {
  const tree = getDocsTree();

  const folders = tree.filter((n) => n.type === "folder");
  const files = tree.filter((n) => n.type === "file");

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-16 sm:px-8">
      {/* Header */}
      <header className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Interview Guides
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Comprehensive preparation guides for technical interviews across
          frontend, backend, and mobile development.
        </p>
      </header>

      {/* Guide Sections */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Guides
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Link
              key={folder.slug}
              href={folder.children?.[0]?.slug || folder.slug}
              className="group rounded-xl border border-zinc-200 p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <h3 className="font-semibold text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                {formatLabel(folder.name)}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {folder.children?.length || 0} chapters
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Reference */}
      {files.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Quick Reference
          </h2>
          <div className="space-y-2">
            {files.map((file) => (
              <Link
                key={file.slug}
                href={file.slug}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {formatLabel(file.name)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
