import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';
import { IGameUI, ObjectId, BBoxId } from '../../commons/CommonsTypes';
import { ObjectProperty } from '../../objects/ObjectsTypes';
import { BBoxProperty } from '../../boundingBoxes/BoundingBoxTypes';
import { createObjectsLayer } from '../../objects/ObjectsRenderer';
import { sleep } from '../../utils/GameUtils';
import { magnifyingGlass } from './GameModeExploreTypes';
import { getBackToMenuContainer } from '../GameModeHelper';

class GameModeExplore implements IGameUI {
  private objects: Map<ObjectId, ObjectProperty>;
  private boundingBoxes?: Map<BBoxId, BBoxProperty>;

  constructor(objects?: Map<ObjectId, ObjectProperty>, boundingBoxes?: Map<BBoxId, BBoxProperty>) {
    this.objects = objects || new Map<ObjectId, ObjectProperty>();
    this.boundingBoxes = boundingBoxes || new Map<BBoxId, BBoxProperty>();
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const [, objectLayerContainer] = createObjectsLayer(gameManager, this.objects, {
      cursor: magnifyingGlass
    });

    console.log(this.boundingBoxes);

    exploreMenuContainer.add(objectLayerContainer);
    exploreMenuContainer.add(getBackToMenuContainer());

    return exploreMenuContainer;
  }

  public async activateUI(container: Phaser.GameObjects.Container): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    gameManager.input.setDefaultCursor(magnifyingGlass);

    gameManager.add.existing(container);
    container.setActive(true);
    container.setVisible(true);
  }

  public async deactivateUI(container: Phaser.GameObjects.Container): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('DeactivateUI: Game Manager is not defined!');
    }

    gameManager.input.setDefaultCursor('');
    container.setPosition(container.x, 0);

    await sleep(500);
    container.setVisible(false);
    container.setActive(false);
  }
}

export default GameModeExplore;
