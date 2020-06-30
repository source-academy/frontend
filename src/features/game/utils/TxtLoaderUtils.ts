import { loadData } from '../save/GameSaveRequests';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import Parser from '../parser/Parser';
import { loadText } from 'src/features/storySimulator/utils/LoaderUtils';
import { defaultChapter } from '../commons/CommonAssets';

export async function callGameManagerOnTxtLoad(
  scene: Phaser.Scene,
  fileName: string,
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  const chapterKey = `#${fileName}`;
  await loadText(scene, chapterKey, fileName);
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
