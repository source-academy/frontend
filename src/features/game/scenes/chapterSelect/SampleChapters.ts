import { GameChapter } from '../../chapter/GameChapterTypes';

export const SampleChapters: GameChapter[] = [
  {
    title: 'Spaceship Emergency',
    previewBgPath: '/ui/defaultLocation.jpg',
    checkpointsFilenames: ['../assets/chapter0.txt', '../assets/chapter0.1.txt']
  },
  {
    title: 'Alien Attack',
    previewBgPath: '/ui/defaultLocation.jpg',
    checkpointsFilenames: ['../assets/chapter1.txt']
  },
  {
    title: 'Jedi Master',
    previewBgPath: '/ui/defaultLocation.jpg',
    checkpointsFilenames: ['../assets/chapter2.txt']
  }
];
