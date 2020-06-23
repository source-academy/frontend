export function callGameManagerOnTxtLoad(
  scene: Phaser.Scene,
  fileName: string,
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  const key = `#${fileName}`;

  if (scene.cache.text.exists(key)) {
    startGameManager(scene, key, continueGame, chapterNum, checkpointNum);
    return;
  }

  scene.load.text(key, fileName);
  scene.load.once('filecomplete', (key: string) => {
    startGameManager(scene, key, continueGame, chapterNum, checkpointNum);
  });
  scene.load.start();
}

function startGameManager(
  scene: Phaser.Scene,
  key: string,
  continueGame: boolean,
  chapterNum: number,
  checkpointNum: number
) {
  if (key[0] === '#') {
    const text = scene.cache.text.get(key);
    scene.scene.start('GameManager', {
      text,
      continueGame: continueGame,
      chapterNum: chapterNum,
      checkpointNum
    });
  }
}
