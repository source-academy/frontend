import { AssetKey } from 'src/features/game/commons/CommonTypes';
import { iconBg } from '../utils/StorySimulatorAssets';
import { CursorMode } from './SSCursorModeTypes';
import {
  iconBgSize,
  iconSize,
  iconSpacing,
  inactiveAlpha,
  activeAlpha,
  onHoverAlpha,
  altTextStyle,
  altTextYPos,
  altTextXPos
} from './SSCursorModeConstants';
import { Constants } from 'src/features/game/commons/CommonConstants';
import { HexColor } from 'src/features/game/utils/StyleUtils';

export default class SSCursorMode extends Phaser.GameObjects.Container {
  private isModes: Array<boolean>;
  private currCursorMode: CursorMode;
  private cursorModes: Array<Phaser.GameObjects.Container>;
  private currActiveModeIdx: number;

  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    defaultCursorMode: CursorMode = CursorMode.DragResizeObj
  ) {
    super(scene, x, y);
    this.currCursorMode = defaultCursorMode;
    this.isModes = new Array<boolean>();
    this.cursorModes = new Array<Phaser.GameObjects.Container>();
    this.currActiveModeIdx = -1;
  }

  public getCurrCursorMode() {
    return this.currCursorMode;
  }

  public setCursorMode(newMode: CursorMode) {
    this.currCursorMode = newMode;
  }

  public addCursorMode(
    scene: Phaser.Scene,
    assetKey: AssetKey,
    isMode: boolean = true,
    text: string = '',
    onClick: () => void = Constants.nullFunction,
    onHover: () => void = Constants.nullFunction,
    onOut: () => void = Constants.nullFunction
  ) {
    // Main container
    const cursorModeContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    const modeIconBg = new Phaser.GameObjects.Sprite(scene, 0, 0, iconBg.key)
      .setDisplaySize(iconBgSize, iconBgSize)
      .setAlpha(inactiveAlpha)
      .setInteractive({ pixelPerfect: true, useHandCursor: true });

    // Icon
    const modeIcon = new Phaser.GameObjects.Sprite(scene, 0, 0, assetKey).setDisplaySize(
      iconSize,
      iconSize
    );

    // On hover text container
    const altTextBg = new Phaser.GameObjects.Rectangle(
      scene,
      0,
      0,
      180,
      40,
      HexColor.darkBlue
    ).setAlpha(0.7);
    const altText = new Phaser.GameObjects.Text(scene, 0, 0, text, altTextStyle).setOrigin(
      0.5,
      0.5
    );
    const altTextContainer = new Phaser.GameObjects.Container(scene, altTextXPos, altTextYPos, [
      altTextBg,
      altText
    ]);

    // Hide it by default
    altTextContainer.setVisible(false);

    // Update
    this.isModes.push(isMode);
    this.cursorModes.push(cursorModeContainer);
    const currIdx = this.cursorModes.length - 1;

    // Set listeners
    modeIconBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      if (this.isModes[currIdx]) this.currActiveModeIdx = currIdx;
      onClick();
      this.renderCursorModesContainer();
    });
    modeIconBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      if (text !== '') altTextContainer.setVisible(true);
      cursorModeContainer.setAlpha(onHoverAlpha);
      onHover();
    });
    modeIconBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      altTextContainer.setVisible(false);
      const activeMode = currIdx === this.currActiveModeIdx && this.isModes[currIdx];
      cursorModeContainer.setAlpha(activeMode ? activeAlpha : inactiveAlpha);
      onOut();
    });

    cursorModeContainer.add([modeIconBg, modeIcon, altTextContainer]);
  }

  public renderCursorModesContainer() {
    this.removeAll(false);
    let spacing = 0;
    this.cursorModes.forEach((mode, index) => {
      mode.setPosition(0, spacing);
      const activeMode = index === this.currActiveModeIdx && this.isModes[index];
      mode.setAlpha(activeMode ? activeAlpha : inactiveAlpha);
      this.add(mode);
      spacing += iconBgSize + iconSpacing;
    });
  }
}
