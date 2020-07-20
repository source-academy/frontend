import { GameChapter } from '../../chapter/GameChapterTypes';

export const SampleChapters: GameChapter[] = [
  {
    title: 'Spaceship Emergency',
    imageUrl: '/locations/planet-y-orbit/crashing.png',
    filenames: ['../assets/chapter0.txt', '../assets/chapter0.1.txt']
  },
  {
    title: 'Alien Attack',
    imageUrl: '/locations/telebay/emergency.png',
    filenames: ['../assets/chapter1.txt']
  },
  {
    title: 'Jedi Master',
    imageUrl: '/locations/classroom/normal.png',
    filenames: ['../assets/chapter2.txt']
  }
];
