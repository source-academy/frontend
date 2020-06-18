import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { BBoxProperty } from './GameBoundingBoxTypes';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';

class GameBoundingBoxManager {
  private bboxIdMap: Map<ItemId, Phaser.GameObjects.GameObject>;
  private bboxContainerMap: Map<LocationId, Phaser.GameObjects.Container>;

  constructor() {
    this.bboxIdMap = new Map<ItemId, Phaser.GameObjects.GameObject>();
    this.bboxContainerMap = new Map<LocationId, Phaser.GameObjects.Container>();
  }

  public processBBox(chapter: GameChapter) {
    const locations = chapter.map.getLocations();

    const gameManager = GameActionManager.getInstance().getGameManager();

    locations.forEach(location => {
      const bboxContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
      this.bboxContainerMap.set(location.id, bboxContainer);
      gameManager.add.existing(bboxContainer);
    });
  }

  public createBBoxLayerContainer(
    bboxIds: ItemId[],
    locationId: LocationId
  ): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    // Destroy the old container
    this.bboxContainerMap.get(locationId)!.destroy();

    const bboxPropMap = GameActionManager.getInstance().getBBoxPropertyMap();
    const bboxContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    bboxIds.forEach(id => {
      const toRenderBboxProperty = bboxPropMap.get(id);
      if (toRenderBboxProperty) {
        const bbox = this.createBBox(gameManager, toRenderBboxProperty);
        this.bboxIdMap.set(id, bbox);
        bboxContainer.add(bbox);
      }
    });
    return bboxContainer;
  }

  public renderBBoxLayerContainer(locationId: LocationId): void {
    const hasUpdate = GameActionManager.getInstance().hasLocationUpdate(
      locationId,
      GameMode.Explore
    );
    let bboxContainer = this.bboxContainerMap.get(locationId);

    // If update, create new bbox Container
    if (hasUpdate || !bboxContainer) {
      const bboxIdsToRender =
        GameActionManager.getInstance().getLocationAttr(
          GameLocationAttr.boundingBoxes,
          locationId
        ) || [];
      bboxContainer = this.createBBoxLayerContainer(bboxIdsToRender, locationId);
      this.bboxContainerMap.set(locationId, bboxContainer);
    }
    GameActionManager.getInstance().addContainerToLayer(Layer.BBox, bboxContainer);
  }

  public addInteractiveBBoxListeners(
    locationId: LocationId,
    event: string | symbol,
    fn: (id: ItemId) => void
  ) {
    const bboxIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.boundingBoxes,
      locationId
    );
    const bboxPropMap = GameActionManager.getInstance().getBBoxPropertyMap();
    if (bboxIds) {
      bboxIds.forEach((id: ItemId) => {
        const bboxProp = bboxPropMap.get(id);
        if (bboxProp && bboxProp.isInteractive) {
          this.addBBoxListener(id, event, () => fn(id));
        }
      });
    }
  }

  public removeInteractiveBBoxListeners(locationId: LocationId, event: string | symbol) {
    const bboxIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.boundingBoxes,
      locationId
    );
    const bboxPropMap = GameActionManager.getInstance().getBBoxPropertyMap();
    if (bboxIds) {
      bboxIds.forEach((id: ItemId) => {
        const bboxProp = bboxPropMap.get(id);
        if (bboxProp && bboxProp.isInteractive) this.removeBBoxListener(id, event);
      });
    }
  }

  private addBBoxListener(id: ItemId, event: string | symbol, fn: () => void) {
    const bbox = this.bboxIdMap.get(id);
    if (bbox) bbox.addListener(event, fn);
  }

  private removeBBoxListener(id: ItemId, event: string | symbol) {
    const bbox = this.bboxIdMap.get(id);
    if (bbox) bbox.removeListener(event);
  }

  private createBBox(
    gameManager: GameManager,
    bboxProperty: BBoxProperty
  ): Phaser.GameObjects.Rectangle {
    const { x, y, width, height } = bboxProperty;
    const bboxSprite = new Phaser.GameObjects.Rectangle(gameManager, x, y, width, height, 0, 0);
    if (bboxProperty.isInteractive) {
      bboxSprite.setInteractive();
    }
    return bboxSprite;
  }
}

export default GameBoundingBoxManager;
