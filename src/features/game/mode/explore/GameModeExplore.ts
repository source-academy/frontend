import GameActionManager from 'src/features/game/action/GameActionManager';
import { IGameUI, ObjectId, BBoxId } from '../../commons/CommonsTypes';
import { ObjectProperty } from '../../objects/ObjectsTypes';
import { BBoxProperty } from '../../boundingBoxes/BoundingBoxTypes';
import { createObjectsLayer } from '../../objects/ObjectsRenderer';
import { sleep } from '../../utils/GameUtils';
import { magnifyingGlass } from './GameModeExploreConstants';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocationAttr } from '../../location/GameMapTypes';

class GameModeExplore implements IGameUI {
  private locationName: string;
  private objectIds: ObjectId[];
  private bboxIds: BBoxId[];
  private objects: Map<ObjectId, ObjectProperty>;
  private boundingBoxes?: Map<BBoxId, BBoxProperty>;

  constructor(
    locationName: string,
    objectIds?: ObjectId[],
    bboxIds?: BBoxId[],
    objects?: Map<ObjectId, ObjectProperty>,
    boundingBoxes?: Map<BBoxId, BBoxProperty>
  ) {
    this.locationName = locationName;
    this.objects = objects || new Map<ObjectId, ObjectProperty>();
    this.boundingBoxes = boundingBoxes || new Map<BBoxId, BBoxProperty>();
    this.objectIds = objectIds || [];
    this.bboxIds = bboxIds || [];
  }

  private fetchLatestState() {
    const latestObjIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.objects,
      this.locationName
    );
    const latestBBoxIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.boundingBoxes,
      this.locationName
    );
    if (!latestObjIds || !latestBBoxIds) {
      return;
    }
    this.objectIds = latestObjIds;
    this.bboxIds = latestBBoxIds;
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Fetch latest state if location is not yet visited
    const hasUpdates = GameActionManager.getInstance().hasLocationUpdate(this.locationName);
    if (hasUpdates) {
      this.fetchLatestState();
    }

    const [, objectLayerContainer] = createObjectsLayer(gameManager, this.objectIds, this.objects, {
      cursor: magnifyingGlass
    });

    console.log(this.boundingBoxes);
    console.log(this.bboxIds);

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
