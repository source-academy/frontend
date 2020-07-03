export type MaterialData = {
  title: string;
  description: string;
  inserted_at: string;
  updated_at: string;
  id: number;
  uploader: {
    id: number;
    name: string;
  };
  url: string;
};

export type DirectoryData = {
  id: number;
  title: string;
};
