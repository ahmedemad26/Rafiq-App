import type { UpdateProjectValues } from "@/lib/schemes/products-shema/update-project.shema";

export interface UpdateProjectPayload {
  projectId: string;
  values: UpdateProjectValues;
}
