import { loadData } from '../save/GameSaveRequests';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import Parser from '../parser/Parser';
import { loadText } from 'src/features/storySimulator/utils/LoaderUtils';
import { defaultChapter } from '../commons/CommonAssets';
import { GameChapter } from '../chapter/GameChapterTypes';

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
  await loadText(scene, defaultChapter.key, defaultChapter.path);

  const text = scene.cache.text.get(chapterKey);
  const defaultChapterText = scene.cache.text.get(defaultChapter.key);

  const accountInfo = getSourceAcademyGame().getAccountInfo();
  if (!accountInfo) {
    return;
  }
  const fullSaveState = await loadData(accountInfo);
  Parser.parse(defaultChapterText);
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
