import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';

import { Constants } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import { blink } from '../effects/FadeEffect';
import GlowingImage from '../effects/GlowingObject';
import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { StateObserver } from '../state/GameStateTypes';
import { ActivatableObject, ObjectProperty } from './GameObjectTypes';

/**
 * Manager that renders objects in a location
 * and also attaches actions as onClick callbacks to objects
 *
 * It provides the activate/and deactivate interfaces
 * for Explore mode to call, as well as
 * provide API for make_object_glow and make_object_blink actions
 */
class GameObjectManager implements StateObserver {
  public observerId: string;
  private objects: Map<ItemId, ActivatableObject>;

  constructor() {
    this.observerId = 'GameObjectManager';
    this.objects = new Map<ItemId, ActivatableObject>();
  }

  public initialise() {
    GameGlobalAPI.getInstance().subscribeState(this);
  }

  public notify(locationId: LocationId) {
    const hasUpdate = GameGlobalAPI.getInstance().hasLocationUpdate(locationId, GameMode.Explore);
    const currLocationId = GameGlobalAPI.getInstance().getCurrLocId();
    if (hasUpdate && locationId === currLocationId) {
      this.renderObjectsLayerContainer(locationId);
    }
  }

  private createObjectsLayerContainer(objectIds: ItemId[]): Phaser.GameObjects.Container {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const objectPropMap = GameGlobalAPI.getInstance().getObjPropertyMap();
    const objectContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    objectIds
      .map(id => objectPropMap.get(id))
      .filter(objectProp => objectProp !== undefined)
      .forEach(objectProp => {
        const object = this.createObject(gameManager, objectProp!);
        objectContainer.add((object.sprite as GlowingImage).getContainer());
        this.objects.set(objectProp!.interactionId, object);
        return object;
      });

    return objectContainer;
  }

  public renderObjectsLayerContainer(locationId: LocationId): void {
    GameGlobalAPI.getInstance().clearSeveralLayers([Layer.Objects]);
    const objIdsToRender = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.objects,
      locationId
    );
    const objectContainer = this.createObjectsLayerContainer(objIdsToRender);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Objects, objectContainer);
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
    blink(GameGlobalAPI.getInstance().getGameManager(), object.sprite.getContainer());
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
      object.getClickArea().on('pointerup', async () => {
        onClick(interactionId);
        await GameGlobalAPI.getInstance().processGameActions(actionIds);
      });
      object.getClickArea().on('pointerover', () => {
        onHover(interactionId);
      });
      object.getClickArea().on('pointerout', () => {
        onPointerout(interactionId);
      });
    }

    function deactivate() {
      object.getClickArea().off('pointerup');
      object.getClickArea().off('pointerover');
      object.getClickArea().off('pointerout');
    }

    return {
      sprite: object,
      activate: actionIds ? activate : Constants.nullFunction,
      deactivate
    };
  }
}

export default GameObjectManager;
