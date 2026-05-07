import type { UpdateProjectValues } from "@/lib/schemes/products-shema/update-project.shema";

export type UpdateProjectParams = {
  projectId: string;
  values: UpdateProjectValues;
};
