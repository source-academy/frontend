import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { BBoxProperty } from './GameBoundingBoxTypes';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { StateObserver } from '../state/GameStateTypes';
import { GameMode } from '../mode/GameModeTypes';

class GameBoundingBoxManager implements StateObserver {
  public observerId: string;

  private bboxIdMap: Map<ItemId, Phaser.GameObjects.GameObject>;

  constructor() {
    this.observerId = 'GameBoundingBoxManager';
    this.bboxIdMap = new Map<ItemId, Phaser.GameObjects.GameObject>();
  }

  public initialise() {
    GameActionManager.getInstance().subscribeState(this);
  }

  public notify(locationId: LocationId) {
    const hasUpdate = GameActionManager.getInstance().hasLocationUpdate(
      locationId,
      GameMode.Explore
    );
    const currLocationId = GameActionManager.getInstance().getGameManager().currentLocationId;
    if (hasUpdate && locationId === currLocationId) {
      this.renderBBoxLayerContainer(locationId);
    }
  }

  public createBBoxLayerContainer(bboxIds: ItemId[]): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

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

  public enableBBoxActions(locationId: LocationId) {
    const bboxIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.boundingBoxes,
      locationId
    );
    const bboxPropMap = GameActionManager.getInstance().getBBoxPropertyMap();

    if (!bboxIds) {
      return;
    }

    bboxIds.forEach((id: ItemId) => {
      const bboxProp = bboxPropMap.get(id);
      const bboxSprite = this.bboxIdMap.get(id);

      if (!bboxSprite || !bboxProp) {
        return;
      }

      bboxSprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () =>
        GameActionManager.getInstance().executeStoryAction(bboxProp.actionIds)
      );
    });
  }

  public disableBBoxActions() {
    this.bboxIdMap.forEach((sprite: Phaser.GameObjects.GameObject) =>
      sprite.off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP)
    );
  }

  public renderBBoxLayerContainer(locationId: LocationId): void {
    GameActionManager.getInstance().clearSeveralLayers([Layer.BBox]);
    const bboxIdsToRender =
      GameActionManager.getInstance().getLocationAttr(GameLocationAttr.boundingBoxes, locationId) ||
      [];
    const bboxContainer = this.createBBoxLayerContainer(bboxIdsToRender);
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
