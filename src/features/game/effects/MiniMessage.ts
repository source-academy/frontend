import FontAssets from 'src/features/game/assets/FontAssets';
import ImageAssets from 'src/features/game/assets/ImageAssets';
import SoundAssets from 'src/features/game/assets/SoundAssets';
import { Constants, screenSize } from 'src/features/game/commons/CommonConstants';
import { BitmapFontStyle, IBaseScene } from 'src/features/game/commons/CommonTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import { sleep } from 'src/features/game/utils/GameUtils';
import { createBitmapText } from 'src/features/game/utils/TextUtils';

import { fadeAndDestroy } from './FadeEffect';
import { rightSideEntryTweenProps, rightSideExitTweenProps } from './FlyEffect';

const messageDuration = 3000;
const messageTextConfig = { x: 1900, y: 100, oriX: 1.0, oriY: 0.5 };
const messageStyle: BitmapFontStyle = {
  key: FontAssets.zektonDarkFont.key,
  size: 24,
  align: Phaser.GameObjects.BitmapText.ALIGN_RIGHT
};

/**
 * Generates a closure containing a promise chain of message displaying calls
 * and a function to enqueue more messages to show.
 *
 * @returns a function to display a message
 */
const makeMiniMessageDisplayer = () => {
  let displayMessagesPromise = Promise.resolve();
  const displayMiniMessage = (scene: IBaseScene, text: string) => {
    displayMessagesPromise = displayMessagesPromise.then(() =>
      displayMiniMessageHelper(scene, text)
    );
  };
  return displayMiniMessage;
};

/**
 * A function to display a message on the top right side of the screen.
 * The message will be tweened to enter from the right side of the screen,
 * displayed for a duration, before tweened out. The message will not be
 * shown immediately if there is another message currently being displayed
 * and/or other messages are waiting to be displayed
 *
 * @param scene scene to attach this message to
 * @param text text to be written
 */
export const displayMiniMessage = makeMiniMessageDisplayer();

/**
 * A function to display a message on the top right side of the screen.
 * The message will be tweened to enter from the right side of the screen,
 * displayed for a duration, before tweened out.
 *
 * @param scene scene to attach this message to
 * @param text text to be written
 */
async function displayMiniMessageHelper(scene: IBaseScene, text: string) {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);
  const messageBg = new Phaser.GameObjects.Sprite(
    scene,
    screenSize.x,
    100,
    ImageAssets.messageBar.key
  );
  messageBg.setScale(-1.5, 0.8);
  const messageText = createBitmapText(scene, text, messageTextConfig, messageStyle);

  container.add([messageBg, messageText]);
  scene.getLayerManager().addToLayer(Layer.Effects, container);
  container.setPosition(screenSize.x, 0);
  container.setAlpha(0);

  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifEnter.key);
  scene.add.tween({
    targets: container,
    alpha: 1,
    ...rightSideEntryTweenProps
  });

  await sleep(rightSideEntryTweenProps.duration + messageDuration);

  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifExit.key);
  scene.add.tween({
    targets: container,
    alpha: 1,
    ...rightSideExitTweenProps
  });

  await sleep(rightSideExitTweenProps.duration);
  fadeAndDestroy(scene, container, { fadeDuration: Constants.fadeDuration });
}
