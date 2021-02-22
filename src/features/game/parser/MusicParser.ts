import { LocationId } from '../location/GameMapTypes';
import { GameSoundType } from '../sound/GameSoundTypes';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';

/**
 * This class contains the parser for the BGM and SFX paragraphs
 * within a location
 */
export default class MusicParser {
  /**
   * This function parses a series of sounds and updates
   * the sound assets included in the game map.
   *
   * It also parses the first BGM as the bgm of the location
   *
   * @param locationId The locationId of the BGM/SFX you want to parse
   * @param soundList the list of sounds to be added as assets
   * @param soundType Whether it's BGM or SFX
   */
  public static parse(locationId: LocationId, soundList: string[], soundType: GameSoundType) {
    soundList.forEach((musicDetails, musicIndex) => {
      const [id, assetPath, volume] = StringUtils.splitByChar(musicDetails, ',');
      Parser.validator.registerId(id);

      Parser.checkpoint.map.addSoundAsset({
        key: id,
        path: assetPath,
        config: {
          volume: parseFloat(volume),
          loop: soundType === GameSoundType.BGM
        },
        soundType
      });

      if (soundType === GameSoundType.BGM && musicIndex === 0) {
        Parser.checkpoint.map.setBGMusicAt(locationId, id);
      }
    });
  }
}
