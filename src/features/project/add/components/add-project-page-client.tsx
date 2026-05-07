"use client";

import { useRouter } from "next/navigation";
import AddProjectForm from "./add-project-form";
import CreateProjectBreadcrumb from "./create-project-breadcrumb";

export default function AddProjectPageClient() {
  const router = useRouter();

  return (
    <section className="-mx-6 -mt-6 flex min-h-[calc(100svh-8rem)] flex-col overflow-x-hidden bg-[#F4F7FA] px-6 pb-16 pt-0">
      <div className="flex w-full flex-1 flex-col">
        <div className="mt-2 w-full shrink-0 text-left sm:mt-3">
          <CreateProjectBreadcrumb />
          <h1 className="mb-6 text-3xl font-bold leading-none tracking-tight text-[#11284d]">Add New Project</h1>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1">
          <AddProjectForm onSuccess={() => router.push("/project")} onCancel={() => router.push("/project")} />
        </div>
      </div>
    </section>
  );
}
