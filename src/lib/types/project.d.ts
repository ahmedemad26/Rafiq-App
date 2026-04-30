export type ProjectDetail = {
  id: string;
  name: string;
  description: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  created_at: string | null;
};


export type ProjectRow = {
  id: string;
  name: string;
  description: string;
  created_at: string | null;
};

export type GetProjectsPageParams = {
  limit: number;
  offset: number;
};

export type GetProjectsPageSuccess = {
  data: ProjectRow[];
  totalCount: number;
  range: { start: number; end: number } | null;
};

export type GetProjectsPageResult =
  | { error: string }
  | GetProjectsPageSuccess;



export type ProjectDetails = {
  id: string;
  name: string;
  description: string;
};

type ParsedRange = {
  start: number;
  end: number;
  totalCount: number;
};
export type ProjectDetail = Omit<Project, "created_at">;