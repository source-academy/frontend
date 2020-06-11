import { GameLocation } from '../../location/GameMapTypes';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';
import { IGameUI } from '../../commons/CommonsTypes';

class GameModeExplore implements IGameUI {
  private location: GameLocation;
  constructor(location: GameLocation) {
    this.location = location;
  }
  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    console.log(this.location);

    const modeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    return modeMenuContainer;
  }

  public async activateUI(container: Phaser.GameObjects.Container): Promise<void> {}

  public async deactivateUI(container: Phaser.GameObjects.Container): Promise<void> {}
}

export default GameModeExplore;
