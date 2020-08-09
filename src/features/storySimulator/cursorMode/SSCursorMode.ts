import { Constants } from 'src/features/game/commons/CommonConstants';
import CommonTextHover from 'src/features/game/commons/CommonTextHover';
import { AssetKey } from 'src/features/game/commons/CommonTypes';
import { createButton } from 'src/features/game/utils/ButtonUtils';

import SSImageAssets from '../assets/ImageAssets';
import SSCursorModeConstants from './SSCursorModeConstants';
import { CursorMode } from './SSCursorModeTypes';

/**
 * This manager manages rendering of the cursor mode icons
 * and manages which SS cursor mode is activated
 */
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
    this.currActiveModeIdx = Constants.nullSequenceNumber;
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

    // Update
    this.isModes.push(isMode);
    this.cursorModes.push(cursorModeContainer);
    const currIdx = this.cursorModes.length - 1;

    // On hover text container
    const hoverText = new CommonTextHover(scene, 0, 0, text);

    const onUp = () => {
      if (this.isModes[currIdx]) this.currActiveModeIdx = currIdx;
      onClick();
      this.renderCursorModesContainer();
    };

    const onHoverWrapper = () => {
      if (text !== '') hoverText.setVisible(true);
      cursorModeContainer.setAlpha(SSCursorModeConstants.alpha.hover);
      onHover();
    };

    const onOutWrapper = () => {
      hoverText.setVisible(false);
      const activeMode = currIdx === this.currActiveModeIdx && this.isModes[currIdx];
      cursorModeContainer.setAlpha(
        activeMode ? SSCursorModeConstants.alpha.active : SSCursorModeConstants.alpha.inactive
      );
      onOut();
    };

    const modeButton = createButton(scene, {
      assetKey: SSImageAssets.iconBg.key,
      onUp: onUp,
      onHover: onHoverWrapper,
      onOut: onOutWrapper,
      onPointerMove: (pointer: Phaser.Input.Pointer) => {
        hoverText.x = pointer.x - cursorModeContainer.x - 100;
        hoverText.y = pointer.y - cursorModeContainer.y - 100;
      },
      onHoverEffect: false
    });

    // Icon
    const modeIcon = new Phaser.GameObjects.Sprite(scene, 0, 0, assetKey).setDisplaySize(
      SSCursorModeConstants.icon.size,
      SSCursorModeConstants.icon.size
    );

    modeButton.add(modeIcon);

    cursorModeContainer.add([modeButton, hoverText]);
  }

  public renderCursorModesContainer() {
    this.removeAll(false);
    let spacing = 0;
    this.cursorModes.forEach((mode, index) => {
      mode.setPosition(0, spacing);
      const activeMode = index === this.currActiveModeIdx && this.isModes[index];
      mode.setAlpha(
        activeMode ? SSCursorModeConstants.alpha.active : SSCursorModeConstants.alpha.inactive
      );
      this.add(mode);
      spacing += SSCursorModeConstants.icon.bgSize + SSCursorModeConstants.icon.yInterval;
    });
  }
}
