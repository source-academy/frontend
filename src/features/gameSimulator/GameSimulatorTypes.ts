export enum GameSimulatorState {
  Default = 'Default',
  AssetViewer = 'AssetViewer',
  ChapterSimulator = 'ChapterSimulator',
  ChapterPublisher = 'ChapterPublisher'
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

export type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  chapterFilenames?: string[];
};

export type AssetProps = {
  assetPath: string;
};

export type StorageProps = {
  storageName: string;
  s3TxtFiles: string[];
};
