export const newChapterIndex = -1;

export const dateOneYearFromNow = (date: Date) => {
  date.setFullYear(date.getFullYear() + 1);
  return date;
};

export const defaultChapter = {
  id: newChapterIndex,
  title: '',
  imageUrl: '/locations/spaceshipBackground.png',
  openAt: new Date().toISOString(),
  closeAt: dateOneYearFromNow(new Date()).toISOString(),
  isPublished: false,
  filenames: []
};
