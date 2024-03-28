import TextAssets, { MockTextAssets, toTxtPath } from '../assets/TextAssets';
import Parser from '../parser/Parser';
import SourceAcademyGame from '../SourceAcademyGame';
import { loadText } from './LoaderUtils';

/**
 * Starts a new checkpoint with the given chapter number
 * and checkpoint number. The chapter/checkpoint file
 * will also be appended with the default checkpoint text.
 *
 * @param continueGame if true, will load the last checkpoint. Else, restart the chapter.
 * @param chapterNum chapter number
 * @param checkpointNum checkpoint number
 */
export async function callGameManagerOnTxtLoad(
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  const textAssets = SourceAcademyGame.getInstance().getIsUsingMock() ? MockTextAssets : TextAssets;
  const scene = SourceAcademyGame.getInstance().getCurrentSceneRef();
  const gameChapters = SourceAcademyGame.getInstance().getGameChapters();
  const filename = gameChapters[chapterNum].filenames[checkpointNum];
  if (!filename) {
    return;
  }

  await loadText(scene, filename, filename);
  await loadText(scene, textAssets.defaultCheckpoint.key, textAssets.defaultCheckpoint.path);

  const text = scene.cache.text.get(filename);
  const defaultCheckpointText = scene.cache.text.get(textAssets.defaultCheckpoint.key);

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

/**
 * Starts a new checkpoint using the next checkpoint in the
 * the chapter simulator stack
 */
export async function callGameManagerForSim() {
  const scene = SourceAcademyGame.getInstance().getCurrentSceneRef();
  const checkpointFilenames = SourceAcademyGame.getInstance().getSSChapterSimFilenames();
  if (!checkpointFilenames.length) {
    scene.scene.start('GameSimulatorMenu');
    return;
  }
  const filename = checkpointFilenames.pop() as string;
  await loadText(scene, filename, toTxtPath(filename));
  await loadText(scene, TextAssets.defaultCheckpoint.key, TextAssets.defaultCheckpoint.path);

  const text = scene.cache.text.get(filename);
  const defaultCheckpointText = scene.cache.text.get(TextAssets.defaultCheckpoint.key);

  Parser.parse(defaultCheckpointText);
  Parser.parse(text, true);
  const gameCheckpoint = Parser.checkpoint;

  scene.scene.start('GameManager', {
    gameCheckpoint,
    chapterNum: -1,
    checkpointNum: -1
  });
  return true;
}
