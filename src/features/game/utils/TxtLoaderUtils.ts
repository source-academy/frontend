import { loadData } from '../save/GameSaveRequests';
import phaserGame from 'src/pages/academy/game/subcomponents/phaserGame';
import Parser from '../parser/Parser';

export async function callGameManagerOnTxtLoad(
  scene: Phaser.Scene,
  fileName: string,
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  const key = `#${fileName}`;

  if (scene.cache.text.exists(key)) {
    await startGameManager(scene, key, continueGame, chapterNum, checkpointNum);
    return;
  }

  scene.load.text(key, fileName);
  scene.load.once('filecomplete', (key: string) => {
    startGameManager(scene, key, continueGame, chapterNum, checkpointNum);
  });
  scene.load.start();
}

async function startGameManager(
  scene: Phaser.Scene,
  key: string,
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  if (key[0] === '#') {
    const text = scene.cache.text.get(key);
    const fullSaveState = await loadData(phaserGame.getAccountInfo());
    const gameCheckpoint = Parser.parse(text);

    scene.scene.start('GameManager', {
      fullSaveState,
      gameCheckpoint,
      continueGame: continueGame,
      chapterNum: chapterNum,
      checkpointNum
    });
  }
}
