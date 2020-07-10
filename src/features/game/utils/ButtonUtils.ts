import { BitmapFontStyle, AssetKey } from '../commons/CommonTypes';
import { createBitmapText } from './TextUtils';
import { Constants } from '../commons/CommonConstants';
import SoundAssets from '../assets/SoundAssets';
import GameSoundManager from '../sound/GameSoundManager';

type ButtonConfig = {
  assetKey: AssetKey;
  message?: string;
  textConfig?: ButtonTextConfig;
  bitMapTextStyle?: BitmapFontStyle;
  onDown?: () => void;
  onUp?: () => void;
  onHover?: () => void;
  onOut?: () => void;
  onHoverEffect?: boolean;
  onClickSound?: AssetKey;
  onHoverSound?: AssetKey;
};

type ButtonTextConfig = { x: number; y: number; oriX: number; oriY: number };

const onHoverAlpha = 1.0;
const offHoverAlpha = 0.9;

export function createButton(
  scene: Phaser.Scene,
  {
    assetKey,
    message = '',
    textConfig = { x: 0, y: 0, oriX: 0, oriY: 0 },
    bitMapTextStyle = Constants.defaultFontStyle,
    onDown = Constants.nullFunction,
    onUp = Constants.nullFunction,
    onHover = Constants.nullFunction,
    onOut = Constants.nullFunction,
    onHoverEffect = true,
    onClickSound = SoundAssets.buttonClick.key,
    onHoverSound = SoundAssets.buttonHover.key
  }: ButtonConfig,
  soundManager?: GameSoundManager
): Phaser.GameObjects.Container {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);
  const { x, y, oriX, oriY } = textConfig;

  // Set up button functionality
  const button = new Phaser.GameObjects.Sprite(scene, 0, 0, assetKey);
  button.setInteractive({ pixelPerfect: true, useHandCursor: true });
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
    if (soundManager) soundManager.playSound(onClickSound);
    onUp();
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
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    onDown();
  });

  // Set up text
  const text = createBitmapText(scene, message, x, y, bitMapTextStyle);
  text.setOrigin(oriX, oriY);

  container.add([button, text]);
  if (onHoverEffect) container.setAlpha(offHoverAlpha);

  return container;
}
