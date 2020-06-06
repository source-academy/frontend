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
  filename: string;
};

export const defaultGameStateText = `{
  "sessionData": {
    "story": {
      "story": "sidequest-9.1",
      "playStory": false
    },
    "currentDate": "2020-04-12T14:22:03",
    "gameStates": {
      "collectibles": { "Best Coder": "completed" },
      "completed_quests": ["story-1", "story-2", "sidequest-8"]
    }
  },
  "overrideDates": "true",
  "overridePublish": "true"
}`;

export const OVERRIDE_KEY = 'source_academy_override';
export const OVERRIDE_DATES_KEY = 'source_academy_override_dates';
export const OVERRIDE_PUBLISH_KEY = 'source_academy_override_publish';
export const STORY_ID = 'source_academy_story_id';
