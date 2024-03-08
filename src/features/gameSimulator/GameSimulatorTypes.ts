export enum GameSimState {
  Default = 'Default',
  AssetUploader = 'AssetUploader',
  CheckpointSim = 'CheckpointSim',
  ChapterSim = 'ChapterSim'
}

export type ChapterDetail = {
  id: string;
  openAt: string;
  closeAt: string;
  title: string;
  filenames: string[];
  isPublished: boolean;
  imageUrl: string;
};
