import Link from "next/link";

type CreateTaskBreadcrumbProps = {
  projectId: string;
  projectTitle: string;
};

export default function CreateTaskBreadcrumb({
  projectId,
  projectTitle,
}: CreateTaskBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 py-2 text-left">
      <ol className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-left text-[11px] font-medium tracking-[0.12em]">
        <li>
          <Link
            href="/project"
            className="uppercase text-slate-500 transition-colors hover:text-slate-700"
          >
            Projects
          </Link>
        </li>
        <li className="select-none text-slate-300" aria-hidden>
          ›
        </li>
        <li>
          <span className="uppercase text-slate-500">{projectTitle}</span>
        </li>
        <li className="select-none text-slate-300" aria-hidden>
          ›
        </li>
        <li>
          <Link
            href={`/project/${projectId}/tasks`}
            className="uppercase text-slate-500 transition-colors hover:text-slate-700"
          >
            Tasks
          </Link>
        </li>
        <li className="select-none text-slate-300" aria-hidden>
          ›
        </li>
        <li>
          <span className="font-bold uppercase text-brand-primary" aria-current="page">
            New task
          </span>
        </li>
      </ol>
    </nav>
  );
}

