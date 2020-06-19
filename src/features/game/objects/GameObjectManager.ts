import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { ObjectProperty } from './GameObjectTypes';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { resize } from '../utils/SpriteUtils';
import { StateObserver } from '../state/GameStateTypes';

class GameObjectManager implements StateObserver {
  public observerId: string;
  private objectIdMap: Map<ItemId, Phaser.GameObjects.GameObject>;

  constructor() {
    this.observerId = 'GameObjectManager';
    this.objectIdMap = new Map<ItemId, Phaser.GameObjects.GameObject>();
  }

  public processObjects(chapter: GameChapter) {
    GameActionManager.getInstance().subscribeState(this);
  }

  public notify(locationId: LocationId) {}

  public createObjectsLayerContainer(objectIds: ItemId[]): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
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
    const objIdsToRender =
      GameActionManager.getInstance().getLocationAttr(GameLocationAttr.objects, locationId) || [];
    const objectContainer = this.createObjectsLayerContainer(objIdsToRender);
    GameActionManager.getInstance().addContainerToLayer(Layer.Objects, objectContainer);
  }

  public enableObjectActions(locationId: LocationId) {
    const objectIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.objects,
      locationId
    );
    const objectPropMap = GameActionManager.getInstance().getObjPropertyMap();

    if (!objectIds) {
      return;
    }

    objectIds.forEach((id: ItemId) => {
      const objectProp = objectPropMap.get(id);
      const objectSprite = this.objectIdMap.get(id);

      if (!objectSprite || !objectProp) {
        return;
      }

      objectSprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () =>
        GameActionManager.getInstance().executeStoryAction(objectProp.actionIds)
      );
    });
  }

  public disableObjectActions() {
    this.objectIdMap.forEach((sprite: Phaser.GameObjects.GameObject) =>
      sprite.off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP)
    );
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
