import { GameChapter } from '../chapter/GameChapterTypes';
// import GameMap from '../location/GameMap';
import LocationSelectChapter from '../scenes/LocationSelectChapter';

export class GameParser {
  public static parse(text: string): GameChapter {
    // const chapter = {
    //   configuration: {},
    //   map: new GameMap(),
    //   startingLoc: ''
    // };
    const two = /<<.+>>/.exec(text);
    // console.log(files);
    console.log(two);

    return LocationSelectChapter;
  }
}
