import { GameLocation } from '../../location/GameMapTypes';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';
import { IGameUI } from '../../commons/CommonsTypes';

class GameModeExplore implements IGameUI {
  private location: GameLocation;
  constructor(location: GameLocation) {
    this.location = location;
  }
  public getUIContainer(): Phaser.GameObjects.Container {
    console.log(this.location);
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const modeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    return modeMenuContainer;
  }

  public async activateUI(container: Phaser.GameObjects.Container): Promise<void> {}

  public async deactivateUI(container: Phaser.GameObjects.Container): Promise<void> {}
}

export default GameModeExplore;
