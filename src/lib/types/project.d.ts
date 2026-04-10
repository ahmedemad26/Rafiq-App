export type CreateProjectResponse = {
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