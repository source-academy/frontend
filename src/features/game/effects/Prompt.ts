import ImageAssets from '../assets/ImageAssets';
import { screenCenter } from '../commons/CommonConstants';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import mainMenuConstants from '../scenes/mainMenu/MainMenuConstants';
import { userStateStyle } from '../state/GameStateConstants';
import { createButton } from '../utils/ButtonUtils';
import { calcTableFormatPos, Direction } from '../utils/StyleUtils';

/**
 * Display a UI that asks users to choose which option they like
 *
 * @param scene - which scene to add this prompt in
 * @param question - question you want to ask
 * @param choices - an array of choices to show
 * @returns {Promise<number>} which choice index the user has chosen
 */
export async function promptWithChoices(
  scene: Phaser.Scene,
  question: string,
  choices: string[]
): Promise<number> {
  const promptContainer = new Phaser.GameObjects.Container(scene, 0, 0);
  GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, promptContainer);

  const textConfig = { x: 0, y: 0, oriX: 0.5, oriY: 0.2 };
  const buttonPositions = calcTableFormatPos({
    direction: Direction.Column,
    numOfItems: choices.length + 1,
    maxYSpace: mainMenuConstants.buttonYSpace
  });

  const activatePromptContainer: Promise<number> = new Promise(resolve => {
    promptContainer.add(
      createButton(scene, {
        assetKey: ImageAssets.longButton.key,
        message: question,
        textConfig,
        bitMapTextStyle: userStateStyle
      }).setPosition(screenCenter.x, buttonPositions[0][1] - screenCenter.y * 0.25)
    );
    promptContainer.add(
      choices.map((response, index) =>
        createButton(scene, {
          assetKey: ImageAssets.longButton.key,
          message: response,
          textConfig,
          bitMapTextStyle: userStateStyle,
          onUp: () => {
            promptContainer.destroy();
            resolve(index);
          }
        }).setPosition(screenCenter.x, buttonPositions[index + 1][1] - screenCenter.y * 0.25)
      )
    );
  });
  const response = await activatePromptContainer;
  return response;
}
