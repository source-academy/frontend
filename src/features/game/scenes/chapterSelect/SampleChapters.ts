import { GameChapter } from '../../chapter/GameChapterTypes';

export const SampleChapters: GameChapter[] = [
  {
    title: 'Spaceship Emergency',
    previewBgPath: '/locations/planet-y-orbit/crashing.png',
    checkpointsFilenames: ['../assets/chapter0.txt', '../assets/chapter0.1.txt']
  },
  {
    title: 'Alien Attack',
    previewBgPath: '/locations/telebay/emergency.png',
    checkpointsFilenames: ['../assets/chapter1.txt']
  },
  {
    title: 'Jedi Master',
    previewBgPath: '/locations/classroom/normal.png',
    checkpointsFilenames: ['../assets/chapter2.txt']
  }
];
