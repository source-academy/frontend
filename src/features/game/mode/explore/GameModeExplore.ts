import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';
import { IGameUI } from '../../commons/CommonsTypes';
import { ObjectPropertyMap } from '../../objects/ObjectsTypes';

class GameModeExplore implements IGameUI {
  private objects: ObjectPropertyMap;
  private boundingBoxes: BoundingBoxMap;

  constructor(objects: ObjectPropertyMap, boundingBoxes: BoundingBoxMap) {}
  public getUIContainer(): Phaser.GameObjects.Container {
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
