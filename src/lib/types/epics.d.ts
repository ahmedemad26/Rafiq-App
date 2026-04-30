export type EpicUser = {
    sub: string;
    name: string;
    email: string;
    department: string;
  };
  
  export type ProjectEpic = {
    id: string;
    epic_id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    created_at: string | null;
    created_by: EpicUser | null;
    assignee: EpicUser | null;
  };
  
  export type GetProjectEpicsParams = {
    projectId: string;
    limit: number;
    offset: number;
    searchTerm?: string;
  };
  
  export type GetProjectEpicsSuccess = {
    data: ProjectEpic[];
    totalCount: number;
    range: { start: number; end: number } | null;
  };    