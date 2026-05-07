export type UpdateEpicPatch = {
  title?: string;
  description?: string | null;
  assignee_id?: string | null;
  deadline?: string | null;
};

type SuccessResult = { data: true };
type ErrorResult = { error: string };
export type UpdateEpicResult = SuccessResult | ErrorResult;
