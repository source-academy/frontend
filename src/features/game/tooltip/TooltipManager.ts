import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import TooltipRenderer from './TooltipRenderer';
class TooltipManager {
  private tooltipRenderer?: TooltipRenderer;

  /**
   *  add a tooltip inside the scene
   */
  public async addTooltip() {
    this.tooltipRenderer = new TooltipRenderer();
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    gameManager.add.existing(this.tooltipRenderer.getTooltipContainer());
  }

  /**
   * make the tooltip display when needed
   * @param x the new x for tooltip
   * @param y the new y for tooltip
   * @param message the text need to be shown in the tooltip
   */
  public async displayTooltip(x: number, y: number, message: string) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const tooltipContainer = this.tooltipRenderer?.getTooltipContainer();
    tooltipContainer?.setX(x);
    tooltipContainer?.setY(y);
    this.tooltipRenderer?.changeText(message);
    gameManager.tweens.add({
      targets: tooltipContainer,
      scaleX: 0.1,
      scaleY: 0.1,
      ease: 'Linear',
      duration: 200
    });
  }

  /**
   *  minimize the tooltip
   */
  public async hideTooltip() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const tooltipContainer = this.tooltipRenderer?.getTooltipContainer();
    this.tooltipRenderer?.changeText('');
    gameManager.tweens.add({
      targets: tooltipContainer,
      scale: 0,
      ease: 'linear',
      duration: 200
    });
    tooltipContainer?.setScale(0);
  }

  /**
   * this function makes the tooltip to move along with the cursor
   * @param x new x for tooltip
   * @param y new y for tooltip
   */
  public async moveTooltip(x: number, y: number) {
    const tooltipContainer = this.tooltipRenderer?.getTooltipContainer();
    tooltipContainer?.setX(x);
    tooltipContainer?.setY(y);
  }
}

export default TooltipManager;
