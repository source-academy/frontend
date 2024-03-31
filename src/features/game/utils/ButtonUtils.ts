import SoundAssets from '../assets/SoundAssets';
import { Constants } from '../commons/CommonConstants';
import { AssetKey, BitmapFontStyle, TextConfig } from '../commons/CommonTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { createBitmapText } from './TextUtils';

type ButtonConfig = {
  assetKey: AssetKey;
  message?: string;
  textConfig?: TextConfig;
  bitMapTextStyle?: BitmapFontStyle;
  onDown?: () => void;
  onUp?: () => void;
  onHover?: () => void;
  onOut?: () => void;
  onPointerMove?: (pointer: Phaser.Input.Pointer, localX: number, localY: number) => void;
  onHoverEffect?: boolean;
  onClickSound?: AssetKey;
  onHoverSound?: AssetKey;
};

const onHoverAlpha = 1.0;
const offHoverAlpha = 0.9;

/**
 * Create an index for the button
 * @param index: index of the button
 * @param text: text of the button
 */
export function createButtonText(index: number, text: string): string {
  return '[ ' + index + ' ]  ' + text;
}

/**
 * Create a button with basic functionalities.
 *
 * Functionalities include:
 * 1. Attached onDown, onUp, onHover, onOut listeners
 * 2. Text writing
 * 3. onHover and onOut alpha changes
 * 4. onClick and onHover sound effect
 *
 * @param scene scene to be attached to
 * @param assetKey asset key to be used as button image
 * @param message text to be written on the button, optional
 * @param textConfig config to apply to the text, optional
 * @param bitMapTextStyle bitMapText style to be used, optional
 * @param onDown callback to execute on onDown event, optional
 * @param onUp callback to execute on onUp event, optional
 * @param onHover callback to execute on onHover event, optional
 * @param onOut callback to execute on onOut event, optional
 * @param onPointerMove callback to execute on onPointerMove, optional
 * @param onHoverEffect if true, button will include onHover and onOut alpha changes, optional
 * @param onClickSound sound key to play when button is clicked, executed onUp, optional
 * @param onHoverSound sound key to play when button is hovered, optional
 * @param soundManager required for sound to be played, optional
 * @returns {Phaser.GameObjects.Container} button container
 */
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
    onPointerMove = Constants.nullFunction,
    onHoverEffect = true,
    onClickSound = SoundAssets.buttonClick.key,
    onHoverSound = SoundAssets.buttonHover.key
  }: ButtonConfig
): Phaser.GameObjects.Container {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);

  // Set up button functionality
  const button = new Phaser.GameObjects.Sprite(scene, 0, 0, assetKey);
  button.setInteractive({ pixelPerfect: true, useHandCursor: true });
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
    SourceAcademyGame.getInstance().getSoundManager().playSound(onClickSound);
    onUp();
  });
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
    SourceAcademyGame.getInstance().getSoundManager().playSound(onHoverSound);
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
  button.addListener(
    Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE,
    (pointer: Phaser.Input.Pointer, localX: number, localY: number) => {
      onPointerMove(pointer, localX, localY);
    }
  );

  // Set up text
  const text = createBitmapText(scene, message, textConfig, bitMapTextStyle);

  container.add([button, text]);
  if (onHoverEffect) container.setAlpha(offHoverAlpha);

  return container;
}
