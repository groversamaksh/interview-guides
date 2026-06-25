export interface DocNode {
  name: string;
  slug: string;
  type: "file" | "folder";
  children?: DocNode[];
}

export interface Breadcrumb {
  label: string;
  href: string;
}
