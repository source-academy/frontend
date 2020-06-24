import { mainMenuStyle, mainMenuYSpace } from 'src/features/game/scenes/mainMenu/MainMenuConstants';
import { screenSize, screenCenter } from 'src/features/game/commons/CommonConstants';
import { mainMenuOptBanner } from 'src/features/game/scenes/mainMenu/MainMenuAssets';

export function vBannerButton(
  scene: Phaser.Scene,
  { text, callback }: { text: string; callback: () => void },
  buttonIndex: number,
  numberOfButtons: number
): Phaser.GameObjects.Container {
  const [x, y] = getVButtonPosition(buttonIndex, numberOfButtons);
  const buttonContainer = new Phaser.GameObjects.Container(scene, x, y);
  const buttonText = new Phaser.GameObjects.Text(scene, 400, -3, text, mainMenuStyle);
  const buttonSprite = new Phaser.GameObjects.Sprite(
    scene,
    0,
    0,
    mainMenuOptBanner.key
  ).setInteractive({ pixelPerfect: true, useHandCursor: true });

  buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);
  buttonContainer.add([buttonSprite, buttonText]);
  return buttonContainer;
}

function getVButtonPosition(buttonIndex: number, numberOfButtons: number) {
  const partitionSize = mainMenuYSpace / numberOfButtons;
  const x = screenCenter.x;

  const newYPos = (screenSize.y - mainMenuYSpace + partitionSize) / 2;
  const y = newYPos + buttonIndex * partitionSize;
  return [x, y];
}
