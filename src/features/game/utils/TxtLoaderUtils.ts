import TextAssets from '../assets/TextAssets';
import Parser from '../parser/Parser';
import SourceAcademyGame from '../SourceAcademyGame';
import { loadText } from '../utils/LoaderUtils';

/**
 * Starts a new checkpoint with the given chapter number
 * and checkpoint number. The chapter/checkpoint file
 * will also be appended with the default checkpoint text.
 *
 * As this function also fetches students information,
 * this method should be 'await'-ed in order to function properly.
 *
 * @param scene previous scene that calls this function
 * @param chapterDetails mapping to be used to determine the chapter/checkpoint file
 * @param continueGame if true, will load the last checkpoint. Else, restart the chapter.
 * @param chapterNum chapter number
 * @param checkpointNum checkpoint number
 */
export async function callGameManagerOnTxtLoad(
  scene: Phaser.Scene,
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  const gameChapters = SourceAcademyGame.getInstance().getGameChapters();
  const filename = gameChapters[chapterNum].filenames[checkpointNum];
  if (!filename) {
    return;
  }
  await loadText(scene, filename, filename);
  await loadText(scene, TextAssets.defaultCheckpoint.key, TextAssets.defaultCheckpoint.path);

  const text = scene.cache.text.get(filename);
  const defaultCheckpointText = scene.cache.text.get(TextAssets.defaultCheckpoint.key);

  Parser.parse(defaultCheckpointText);
  Parser.parse(text, true);
  const gameCheckpoint = Parser.checkpoint;

  scene.scene.start('GameManager', {
    gameCheckpoint,
    continueGame,
    chapterNum,
    checkpointNum
  });
}
