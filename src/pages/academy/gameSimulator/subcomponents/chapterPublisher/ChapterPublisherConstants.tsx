import { dateOneYearFromNow } from './ChapterPublisherUtils';

export const defaultChapter = {
  id: -1,
  title: '',
  imageUrl: '/locations/spaceshipBackground.png',
  openAt: new Date().toISOString(),
  closeAt: dateOneYearFromNow(new Date()).toISOString(),
  isPublished: false,
  filenames: []
};
