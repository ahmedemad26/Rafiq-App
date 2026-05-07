import Link from "next/link";

export default function CreateProjectBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 py-2 text-left">
      <ol className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-left text-[11px] font-medium tracking-[0.12em]">
        <li>
          <Link href="/project" className="uppercase text-slate-500 transition-colors hover:text-slate-700">
            Projects
          </Link>
        </li>
        <li className="text-slate-300 select-none" aria-hidden>
          ›
        </li>
        <li>
          <span className="font-bold uppercase text-brand-primary" aria-current="page">
            Add new project
          </span>
        </li>
      </ol>
    </nav>
  );
}
