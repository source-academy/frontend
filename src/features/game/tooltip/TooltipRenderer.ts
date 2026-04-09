import { createDialogueBox } from '../dialogue/GameDialogueHelper';
import { fadeAndDestroy } from '../effects/FadeEffect';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { createBitmapText } from '../utils/TextUtils';
import { notifStyle, notifTextConfig } from './TooltipConstant';

class TooltipRenderer {
  private text: Phaser.GameObjects.BitmapText;
  private tooltipBox: Phaser.GameObjects.Image;
  private container: Phaser.GameObjects.Container;

  /**
   * @param typeWriterStyle the style of typewriter
   */
  constructor() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.tooltipBox = createDialogueBox(gameManager);
    this.tooltipBox.scaleY = 2;
    this.tooltipBox.y -= 700;
    this.text = createBitmapText(gameManager, '', notifTextConfig, notifStyle);
    this.text.y -= 525;
    this.container = this.getTooltipContainer();
    this.container.scaleX = 0;
    this.container.scaleY = 0;
  }

  /**
   *
   * @returns {Phaser.GameObjects.Container} returns the entire tooltip container
   * that can be added to the scene directly
   */
  public getTooltipContainer() {
    if (this.container) {
      return this.container;
    }
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.container = new Phaser.GameObjects.Container(gameManager, 0, 0);
    this.container.add([this.tooltipBox, this.text]);
    return this.container;
  }

  /**
   * change the text displayed inside tooltip
   */
  public changeText(message: string) {
    this.text.text = message;
  }

  /**
   * destroy the tooltip
   */
  public destroy() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.text.text = '';
    fadeAndDestroy(gameManager, this.getTooltipContainer());
  }
}

export default TooltipRenderer;
