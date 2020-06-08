import { GameButton, IGameUI, GameSprite } from '../commons/CommonsTypes';
import { modeMenuBanner } from './GameModeMenuTypes';

class GameModeMenu implements IGameUI {
  public modeBanner: GameSprite;
  public modeButtons: Array<GameButton>;

  constructor() {
    this.modeButtons = new Array<GameButton>();
    const banner = {
      assetKey: modeMenuBanner.key,
      assetXPos: modeMenuBanner.xPos,
      assetYPos: modeMenuBanner.yPos,
      isInteractive: false
    } as GameSprite;
    this.modeBanner = banner;
  }

  public renderUI(scene: Phaser.Scene): void {
    scene.add.image(this.modeBanner.assetXPos, this.modeBanner.assetYPos, this.modeBanner.assetKey);

    this.modeButtons.forEach(button => {
      scene.add.image(button.assetXPos, button.assetYPos, button.assetKey);

      const text = button.text ? button.text : '';
      const style = button.style ? button.style : {};
      scene.add.text(button.assetXPos, button.assetYPos, text, style).setOrigin(0.5, 0.25);
    });
  }
}

export default GameModeMenu;
