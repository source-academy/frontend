import { loadData } from '../save/GameSaveRequests';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import Parser from '../parser/Parser';
import { loadText } from 'src/features/game/utils/LoaderUtils';
import { GameChapter } from '../chapter/GameChapterTypes';
import TextAssets from '../assets/TextAssets';

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

  const accountInfo = getSourceAcademyGame().getAccountInfo();
  if (!accountInfo) {
    return;
  }
  const fullSaveState = await loadData(accountInfo);
  Parser.parse(defaultCheckpointText);
  Parser.parse(text, true);
  const gameCheckpoint = Parser.checkpoint;

  scene.scene.start('GameManager', {
    isStorySimulator: false,
    fullSaveState,
    gameCheckpoint,
    continueGame,
    chapterNum,
    checkpointNum
  });
}
