import { GameChapter } from './GameChapterTypes';

const GameChapterMocks: GameChapter[] = [
  {
    title: 'Spaceship Emergency',
    imageUrl: '/locations/planet-y-orbit/crashing.png',
    filenames: ['../../assets/mockChapter0.txt', '../../assets/mockChapter0.1.txt']
  },
  {
    title: 'Alien Attack',
    imageUrl: '/locations/telebay/emergency.png',
    filenames: ['../../assets/mockChapter1.txt']
  },
  {
    title: 'Jedi Master',
    imageUrl: '/locations/classroom/normal.png',
    filenames: ['../../assets/mockChapter2.txt']
  }
];
export default GameChapterMocks;
