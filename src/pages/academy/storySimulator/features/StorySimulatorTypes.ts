import { GameSessionData } from 'src/pages/academy/game/gameTypes';

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

export type StoryDetail = {
  Key: string;
};

export type GameSessionOverride = {
  sessionData: GameSessionData;
  overridePublish?: boolean;
  overrideDates?: boolean;
};
