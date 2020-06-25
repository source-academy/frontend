import { AssetKey } from 'src/features/game/commons/CommonsTypes';
import { iconBg } from '../utils/StorySimulatorAssets';
import { CursorMode } from './SSCursorModeTypes';
import { iconBgSize, iconSize, iconSpacing, inactiveAlpha } from './SSCursorModeConstants';

export default class SSCursorMode extends Phaser.GameObjects.Container {
  private currCursorMode: CursorMode;
  private cursorModes: Array<Phaser.GameObjects.Container>;
  private currActiveModeIdx: number;

  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    defaultCursorMode: CursorMode = CursorMode.DragObj
  ) {
    super(scene, x, y);
    this.currCursorMode = defaultCursorMode;
    this.cursorModes = new Array<Phaser.GameObjects.Container>();
    this.currActiveModeIdx = -1;
  }

  public getCurrCursorMode() {
    return this.currCursorMode;
  }

  public addCursorMode(scene: Phaser.Scene, assetKey: AssetKey, callback: any) {
    const cursorModeContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    const modeIconBg = new Phaser.GameObjects.Sprite(scene, 0, 0, iconBg.key).setDisplaySize(
      iconBgSize,
      iconBgSize
    );

    modeIconBg.setInteractive({ pixelPerfect: true, useHandCursor: true });
    modeIconBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.currActiveModeIdx = this.cursorModes.length - 1;
      callback();
      this.renderCursorModesContainer();
    });

    const modeIcon = new Phaser.GameObjects.Sprite(scene, 0, 0, assetKey).setDisplaySize(
      iconSize,
      iconSize
    );
    cursorModeContainer.add([modeIconBg, modeIcon]);
    this.cursorModes.push(cursorModeContainer);
  }

  public renderCursorModesContainer() {
    this.removeAll(true);
    let spacing = 0;

    this.cursorModes.forEach((mode, index) => {
      mode.setPosition(this.x, this.y + spacing);
      if (index !== this.currActiveModeIdx) mode.setAlpha(inactiveAlpha);
      this.add(mode);
      spacing += iconBgSize + iconSpacing;
    });
  }
}
