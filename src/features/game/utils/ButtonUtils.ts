import { BitmapFontStyle, AssetKey } from '../commons/CommonTypes';
import { createBitmapText } from './TextUtils';
import { Constants } from '../commons/CommonConstants';
import SoundAssets from '../assets/SoundAssets';
import GameSoundManager from '../sound/GameSoundManager';

type ButtonTextConfig = { x: number; y: number; oriX: number; oriY: number };

const onHoverAlpha = 1.0;
const offHoverAlpha = 0.8;

export function createButton(
  scene: Phaser.Scene,
  message: string,
  assetKey: AssetKey,
  { x, y, oriX, oriY }: ButtonTextConfig,
  soundManager?: GameSoundManager,
  onClick: () => void = Constants.nullFunction,
  onClickSound: AssetKey = SoundAssets.buttonClick.key,
  bitMapTextStyle: BitmapFontStyle = Constants.defaultFontStyle,
  onHover: () => void = Constants.nullFunction,
  onHoverEffect: boolean = true,
  onHoverSound: AssetKey = SoundAssets.buttonHover.key,
  onOut: () => void = Constants.nullFunction
): Phaser.GameObjects.Container {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);

  // Set up button functionality
  const button = new Phaser.GameObjects.Sprite(scene, 0, 0, assetKey);
  button.setInteractive({ pixelPerfect: true, useHandCursor: true });
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
    if (soundManager) soundManager.playSound(onClickSound);
    onClick();
  });
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
    if (soundManager) soundManager.playSound(onHoverSound);
    if (onHoverEffect) container.setAlpha(onHoverAlpha);
    onHover();
  });
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
    if (onHoverEffect) container.setAlpha(offHoverAlpha);
    onOut();
  });

  // Set up text
  const text = createBitmapText(scene, message, x, y, bitMapTextStyle);
  text.setOrigin(oriX, oriY);

  container.add([button, text]);
  if (onHoverEffect) container.setAlpha(offHoverAlpha);

  return container;
}
