import FontAssets from '../assets/FontAssets';
import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos, Color, HexColor } from '../utils/StyleUtils';
import { fadeAndDestroy } from './FadeEffect';
import { rightSideEntryTweenProps, rightSideExitTweenProps } from './FlyEffect';

const PromptConstants = {
  textPad: 20,
  textConfig: { x: 15, y: -15, oriX: 0.5, oriY: 0.5 },
  y: 100,
  width: 450,
  yInterval: 100
};

const textStyle = {
  fontFamily: 'Verdana',
  fontSize: '20px',
  fill: Color.offWhite,
  align: 'right',
  lineSpacing: 10,
  wordWrap: { width: PromptConstants.width - PromptConstants.textPad * 2 }
};

const promptOptStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

/**
 * Display a UI that asks users to choose which option they like
 *
 * @param scene - which scene to add this prompt in
 * @param text - question you want to ask
 * @param choices - an array of choices to show
 * @returns {Promise<number>} which choice index the user has chosen
 */
export async function promptWithChoices(
  scene: Phaser.Scene,
  text: string,
  choices: string[]
): Promise<number> {
  const promptContainer = new Phaser.GameObjects.Container(scene, 0, 0);

  const promptPartitions = Math.ceil(choices.length / 5);
  const promptHeight = choices.length > 5 ? 5 : choices.length;

  const header = new Phaser.GameObjects.Text(
    scene,
    screenSize.x - PromptConstants.textPad,
    PromptConstants.y,
    text,
    textStyle
  ).setOrigin(1.0, 0.0);
  const promptHeaderBg = new Phaser.GameObjects.Rectangle(
    scene,
    screenSize.x,
    PromptConstants.y - PromptConstants.textPad,
    PromptConstants.width * promptPartitions,
    header.getBounds().bottom * 0.5 + PromptConstants.textPad,
    HexColor.darkBlue,
    0.8
  ).setOrigin(1.0, 0.0);
  const promptBg = new Phaser.GameObjects.Rectangle(
    scene,
    screenSize.x,
    PromptConstants.y - PromptConstants.textPad,
    PromptConstants.width * promptPartitions,
    promptHeaderBg.getBounds().bottom * 0.5 + (promptHeight + 0.5) * PromptConstants.yInterval,
    HexColor.lightBlue,
    0.2
  ).setOrigin(1.0, 0.0);

  promptContainer.add([promptBg, promptHeaderBg, header]);

  const buttonPositions = calcListFormatPos({
    numOfItems: choices.length,
    xSpacing: 0,
    ySpacing: PromptConstants.yInterval
  });

  GameGlobalAPI.getInstance().addToLayer(Layer.UI, promptContainer);

  const activatePromptContainer: Promise<number> = new Promise(resolve => {
    promptContainer.add(
      choices.map((response, index) =>
        createButton(scene, {
          assetKey: ImageAssets.mediumButton.key,
          message: response,
          textConfig: PromptConstants.textConfig,
          bitMapTextStyle: promptOptStyle,
          onUp: () => {
            promptContainer.destroy();
            resolve(index);
          }
        }).setPosition(
          screenSize.x -
            PromptConstants.width / 2 -
            PromptConstants.width * (promptPartitions - Math.floor(index / 5) - 1),
          (buttonPositions[index][1] % (5 * PromptConstants.yInterval)) +
            promptHeaderBg.getBounds().bottom +
            75
        )
      )
    );
  });

  // Animate in
  promptContainer.setPosition(screenSize.x, 0);
  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifEnter.key);
  scene.add.tween({
    targets: promptContainer,
    alpha: 1,
    ...rightSideEntryTweenProps
  });
  await sleep(rightSideEntryTweenProps.duration);

  const response = await activatePromptContainer;

  // Animate out
  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifExit.key);
  scene.add.tween({
    targets: promptContainer,
    alpha: 1,
    ...rightSideExitTweenProps
  });

  await sleep(rightSideExitTweenProps.duration);
  fadeAndDestroy(scene, promptContainer, { fadeDuration: Constants.fadeDuration });

  return response;
}
