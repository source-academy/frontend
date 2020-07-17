import SourceAcademyGame from 'src/pages/academy/game/subcomponents/SourceAcademyGame';

import TextAssets from '../assets/TextAssets';
import { GameChapter } from '../chapter/GameChapterTypes';
import Parser from '../parser/Parser';
import { loadData } from '../save/GameSaveRequests';
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
  chapterDetails: GameChapter[],
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  const filename = chapterDetails[chapterNum].checkpointsFilenames[checkpointNum];
  if (!filename) {
    return;
  }
  const chapterKey = `#${filename}`;
  await loadText(scene, chapterKey, filename);
  await loadText(scene, TextAssets.defaultCheckpoint.key, TextAssets.defaultCheckpoint.path);

  const text = scene.cache.text.get(chapterKey);
  const defaultCheckpointText = scene.cache.text.get(TextAssets.defaultCheckpoint.key);

  const accountInfo = SourceAcademyGame.getInstance().getAccountInfo();
  if (!accountInfo) {
    return;
  }
  const fullSaveState = await loadData();
  Parser.parse(defaultCheckpointText);
  Parser.parse(text, true);
  const gameCheckpoint = Parser.checkpoint;

  scene.scene.start('GameManager', {
    fullSaveState,
    gameCheckpoint,
    continueGame,
    chapterNum,
    checkpointNum
  });
}
