import GameActionManager from 'src/features/game/action/GameActionManager';
import { IGameUI, ObjectId, BBoxId } from '../../commons/CommonsTypes';
import { ObjectProperty } from '../../objects/ObjectsTypes';
import { BBoxProperty } from '../../boundingBoxes/BoundingBoxTypes';
import { createObjectsLayer } from '../../objects/ObjectsRenderer';
import { magnifyingGlass } from './GameModeExploreConstants';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocationAttr } from '../../location/GameMapTypes';

class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
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
    this.uiContainer = undefined;
    this.locationName = locationName;
    this.objects = objects || new Map<ObjectId, ObjectProperty>();
    this.boundingBoxes = boundingBoxes || new Map<BBoxId, BBoxProperty>();
    this.objectIds = objectIds || [];
    this.bboxIds = bboxIds || [];
  }

  public fetchLatestState(): void {
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

    const [objectLayerContainer] = createObjectsLayer(gameManager, this.objectIds, this.objects, {
      cursor: magnifyingGlass
    });

    console.log(this.boundingBoxes?.size);
    console.log(this.bboxIds.length);

    exploreMenuContainer.add(objectLayerContainer);
    exploreMenuContainer.add(getBackToMenuContainer());

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    // Fetch latest state if location is not yet visited
    const hasUpdates = GameActionManager.getInstance().hasLocationUpdate(this.locationName);
    if (hasUpdates || !this.uiContainer) {
      if (this.uiContainer) {
        this.uiContainer.destroy();
      }
      this.fetchLatestState();
      this.uiContainer = await this.getUIContainer();
      gameManager.add.existing(this.uiContainer);
    }

    if (this.uiContainer) {
      this.uiContainer.setActive(true);
      this.uiContainer.setVisible(true);
    }

    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('DeactivateUI: Game Manager is not defined!');
    }

    gameManager.input.setDefaultCursor('');

    if (this.uiContainer) {
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
    }
  }
}

export default GameModeExplore;
