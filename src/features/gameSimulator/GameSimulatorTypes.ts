export enum GameSimulatorState {
  DEFAULT = 'DEFAULT',
  ASSETVIEWER = 'ASSETVIEWER',
  CHAPTERSIMULATOR = 'CHAPTERSIMULATOR',
  CHAPTERPUBLISHER = 'CHAPTERPUBLISHER'
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
