import { createButton } from 'src/features/game/utils/StyleUtils';
import { shortButton } from 'src/features/game/commons/CommonAssets';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import { mainMenuStyle } from 'src/features/game/scenes/mainMenu/MainMenuConstants';

export function objectPlacementButton(
  scene: Phaser.Scene,
  button: { name: string; callback: () => void },
  buttonIndex: number,
  numberOfButtons: number
) {
  return createButton(
    scene,
    button.name,
    button.callback,
    shortButton.key,
    calcCoordinates(buttonIndex, numberOfButtons),
    0.5,
    -0.02,
    mainMenuStyle
  );
}

function calcCoordinates(buttonIndex: number, numberOfButtons: number) {
  return {
    x: (screenSize.x / (numberOfButtons + 1)) * (buttonIndex + 1),
    y: screenSize.y * 0.8
  };
}
