export enum StorySimState {
  Default = 'Default',
  ObjectPlacement = 'ObjectPlacement',
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
