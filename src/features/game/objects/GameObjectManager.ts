import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { ObjectProperty } from './GameObjectTypes';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { resize } from '../utils/SpriteUtils';

class GameObjectManager {
  private objectIdMap: Map<ItemId, Phaser.GameObjects.GameObject>;
  private objectContainerMap: Map<LocationId, Phaser.GameObjects.Container>;

  constructor() {
    this.objectIdMap = new Map<ItemId, Phaser.GameObjects.GameObject>();
    this.objectContainerMap = new Map<LocationId, Phaser.GameObjects.Container>();
  }

  public processObjects(chapter: GameChapter) {
    const locations = chapter.map.getLocations();

    const gameManager = GameActionManager.getInstance().getGameManager();

    locations.forEach(location => {
      const objectContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
      this.objectContainerMap.set(location.id, objectContainer);
      gameManager.add.existing(objectContainer);
    });
  }

  public createObjectsLayerContainer(
    objectIds: ItemId[],
    locationId: LocationId
  ): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    // Destroy the old container
    this.objectContainerMap.get(locationId)!.destroy();

    const objectPropMap = GameActionManager.getInstance().getObjPropertyMap();
    const objectContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    objectIds.forEach(id => {
      const toRenderObjProperty = objectPropMap.get(id);
      if (toRenderObjProperty) {
        const object = this.createObject(gameManager, toRenderObjProperty);
        this.objectIdMap.set(id, object);
        objectContainer.add(object);
      }
    });
    return objectContainer;
  }

  public renderObjectsLayerContainer(locationId: LocationId): void {
    const hasUpdate = GameActionManager.getInstance().hasLocationUpdate(
      locationId,
      GameMode.Explore
    );
    let objectContainer = this.objectContainerMap.get(locationId);

    // If update, create new object Container
    if (hasUpdate || !objectContainer) {
      const objIdsToRender =
        GameActionManager.getInstance().getLocationAttr(GameLocationAttr.objects, locationId) || [];
      objectContainer = this.createObjectsLayerContainer(objIdsToRender, locationId);
      this.objectContainerMap.set(locationId, objectContainer);
    }
    GameActionManager.getInstance().addContainerToLayer(Layer.Objects, objectContainer);
  }

  public enableObjectActions(locationId: LocationId) {
    const objectIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.objects,
      locationId
    );
    const objectPropMap = GameActionManager.getInstance().getObjPropertyMap();

    objectIds.forEach((id: ItemId) => {
      const objectProp = objectPropMap.get(id);
      const objectSprite = this.objectIdMap.get(id);

      if (objectProp && objectProp.actions && objectSprite) {
        objectSprite.on('pointerdown', () =>
          GameActionManager.getInstance().executeStoryAction(objectProp.actions!)
        );
      }
    });
  }

  public disableObjectActions() {
    this.objectIdMap.forEach((sprite: Phaser.GameObjects.GameObject) => sprite.off('pointerdown'));
  }

  public addInteractiveObjectsListeners(
    locationId: LocationId,
    event: string | symbol,
    fn: (id: ItemId) => void
  ) {
    const objectIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.objects,
      locationId
    );
    const objectPropMap = GameActionManager.getInstance().getObjPropertyMap();
    if (objectIds) {
      objectIds.forEach((id: ItemId) => {
        const objectProp = objectPropMap.get(id);
        if (objectProp && objectProp.isInteractive) {
          this.addObjectListener(id, event, () => fn(id));
        }
      });
    }
  }

  public removeInteractiveObjectListeners(locationId: LocationId, event: string | symbol) {
    const objectIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.objects,
      locationId
    );
    const objectPropMap = GameActionManager.getInstance().getObjPropertyMap();
    if (objectIds) {
      objectIds.forEach((id: ItemId) => {
        const objectProp = objectPropMap.get(id);
        if (objectProp && objectProp.isInteractive) this.removeObjectListener(id, event);
      });
    }
  }

  private addObjectListener(id: ItemId, event: string | symbol, fn: () => void) {
    const object = this.objectIdMap.get(id);
    if (object) object.addListener(event, fn);
  }

  private removeObjectListener(id: ItemId, event: string | symbol) {
    const object = this.objectIdMap.get(id);
    if (object) object.removeListener(event);
  }

  private createObject(
    gameManager: GameManager,
    objectProperty: ObjectProperty
  ): Phaser.GameObjects.Image {
    const { assetKey, x, y, width, height } = objectProperty;
    const objectSprite = new Phaser.GameObjects.Image(gameManager, x, y, assetKey);
    if (objectProperty.isInteractive) {
      objectSprite.setInteractive({ pixelPerfect: true });
    }
    const resizedObjectSprite = width ? resize(objectSprite, width, height) : objectSprite;
    return resizedObjectSprite;
  }
}

export default GameObjectManager;
