import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import { ActivatableObject, ObjectProperty } from './GameObjectTypes';
import { ItemId } from '../commons/CommonsTypes';
import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { StateObserver } from '../state/GameStateTypes';
import { GameMode } from '../mode/GameModeTypes';
import GlowingImage from '../effects/GlowingObject';
import { blink } from '../effects/FadeEffect';
import { Constants } from '../commons/CommonConstants';

class GameObjectManager implements StateObserver {
  public observerId: string;
  private objects: Map<ItemId, ActivatableObject>;
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.observerId = 'GameObjectManager';
    this.objects = new Map<ItemId, ActivatableObject>();
    this.gameManager.getStateManager().subscribe(this);
  }

  public notify(locationId: LocationId) {
    const hasUpdate = this.gameManager
      .getStateManager()
      .hasLocationUpdate(locationId, GameMode.Explore);
    if (hasUpdate && locationId === this.gameManager.currentLocationId) {
      this.renderObjectsLayerContainer(locationId);
    }
  }

  private createObjectsLayerContainer(objectIds: ItemId[]): Phaser.GameObjects.Container {
    const objectPropMap = this.gameManager.getStateManager().getObjPropertyMap();
    const objectContainer = new Phaser.GameObjects.Container(this.gameManager, 0, 0);

    objectIds
      .map(id => objectPropMap.get(id))
      .filter(objectProp => objectProp !== undefined)
      .forEach(objectProp => {
        const object = this.createObject(this.gameManager, objectProp!);
        objectContainer.add((object.sprite as GlowingImage).getContainer());
        this.objects.set(objectProp!.interactionId, object);
        return object;
      });

    return objectContainer;
  }

  public renderObjectsLayerContainer(locationId: LocationId): void {
    this.gameManager.getLayerManager().clearSeveralLayers([Layer.Objects]);
    const objIdsToRender =
      this.gameManager.getStateManager().getLocationAttr(GameLocationAttr.objects, locationId) ||
      [];

    const objectContainer = this.createObjectsLayerContainer(objIdsToRender);
    this.gameManager.getLayerManager().addToLayer(Layer.Objects, objectContainer);
  }

  public enableObjectAction(callbacks: any): void {
    this.objects.forEach(object => object.activate(callbacks));
  }

  public disableObjectAction() {
    this.objects.forEach(object => object.deactivate());
  }

  public makeObjectGlow(objectId: ItemId) {
    const object = this.objects.get(objectId);
    if (!object) {
      return;
    }
    (object.sprite as GlowingImage).startGlow();
  }

  public makeObjectBlink(objectId: ItemId) {
    const object = this.objects.get(objectId);
    if (!object) {
      return;
    }
    blink(this.gameManager, object.sprite.getContainer());
  }

  private createObject(
    gameManager: GameManager,
    objectProperty: ObjectProperty
  ): ActivatableObject {
    const { assetKey, x, y, width, height, actionIds, interactionId } = objectProperty;
    const object = new GlowingImage(gameManager, x, y, assetKey, width, height);

    function activate({
      onClick = (id?: ItemId) => {},
      onPointerout = (id?: ItemId) => {},
      onHover = (id?: ItemId) => {}
    }) {
      object.getClickArea().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
        onClick(interactionId);
        await gameManager.getActionExecuter().executeStoryActions(actionIds);
      });
      object.getClickArea().on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        onHover(interactionId);
      });
      object.getClickArea().on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        onPointerout(interactionId);
      });
    }

    function deactivate() {
      object.getClickArea().removeAllListeners();
    }

    return {
      sprite: object,
      activate: actionIds ? activate : Constants.nullFunction,
      deactivate
    };
  }
}

export default GameObjectManager;
