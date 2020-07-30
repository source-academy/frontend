import FontAssets from '../assets/FontAssets';
import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle, IBaseScene } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { sleep } from '../utils/GameUtils';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import { fadeAndDestroy } from './FadeEffect';
import { sideEntryTweenProps, sideExitTweenProps } from './FlyEffect';

const messageDuration = 3000;
const messageTextConfig = { x: 20, y: 100, oriX: 0.0, oriY: 0.5 };
const messageStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 20,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

/**
 * A function to display a message on the top left side of the screen.
 * The message will be tweened to enter from the left side of the screen,
 * displayed for a duration, before tweened out.
 *
 * @param scene scene to attach this message to
 * @param text text to be written
 */
export async function displayMiniMessage(scene: IBaseScene, text: string) {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);
  const messageBg = new Phaser.GameObjects.Sprite(scene, 0, 100, ImageAssets.messageBar.key);
  messageBg.setScale(1, 0.8);
  const messageText = createBitmapText(scene, text, messageTextConfig, messageStyle);

  container.add([messageBg, messageText]);
  scene.getLayerManager().addToLayer(Layer.Effects, container);
  container.setPosition(-screenSize.x, 0);
  container.setAlpha(0);

  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifEnter.key);
  scene.add.tween({
    targets: container,
    alpha: 1,
    ...sideEntryTweenProps
  });

  await sleep(sideEntryTweenProps.duration + messageDuration);

  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifExit.key);
  scene.add.tween({
    targets: container,
    alpha: 1,
    ...sideExitTweenProps
  });

  await sleep(sideExitTweenProps.duration);
  fadeAndDestroy(scene, container, { fadeDuration: Constants.fadeDuration });
}
