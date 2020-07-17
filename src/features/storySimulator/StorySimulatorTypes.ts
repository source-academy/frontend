export enum StorySimState {
  Default = 'Default',
  ObjectPlacement = 'ObjectPlacement',
  AssetUploader = 'AssetUploader',
  CheckpointSim = 'CheckpointSim',
  ChapterSim = 'ChapterSim'
}

export type ChapterDetail = {
  openAt: string;
  closeAt: string;
  title: string;
  filenames: string;
  isPublished: string;
  imageUrl: string;
};
