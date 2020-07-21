import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';

import { Constants } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
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
 * provides API for make_object_glow and make_object_blink actions
 *
 * It is a subject/listener of GameStateManager.
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

  /**
   * Part of observer pattern. Receives notification from GameStateManager.
   *
   * On notify, will rerender all the objects on the location to reflect
   * the update to the state if applicable.
   *
   * @param locationId id of the location being updated
   */
  public notify(locationId: LocationId) {
    // Only inquire on Explore mode, as it is the only mode related to ObjectManager
    const hasUpdate = GameGlobalAPI.getInstance().hasLocationUpdate(locationId, GameMode.Explore);
    const currLocationId = GameGlobalAPI.getInstance().getCurrLocId();
    if (hasUpdate && locationId === currLocationId) {
      // If the update is on the current location, we rerender to reflect the update
      this.renderObjectsLayerContainer(locationId);
    }
  }

  /**
   * Create a container filled with the objects related to the itemIDs.
   *
   * @param objectIds object IDs to be created
   */
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

  /**
   * Clear the layers, and render all the objects available to the location.
   * Will immediately be shown on the screen.
   *
   * @param locationId location in which to render objects at
   */
  public renderObjectsLayerContainer(locationId: LocationId): void {
    GameGlobalAPI.getInstance().clearSeveralLayers([Layer.Objects]);
    const objIdsToRender = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.objects,
      locationId
    );
    const objectContainer = this.createObjectsLayerContainer(objIdsToRender);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Objects, objectContainer);
  }

  /**
   * Allow objects to be interacted with i.e. add listeners to the objects.
   *
   * There are three type of callbacks can be supplied:
   *  - onClick: (ItemId) => void, to be executed when object is clicked
   *  - onHover: (ItemId) => void, to be executed when object is hovered over
   *  - onOut: (ItemId) => void, to be executed when object is out of hover
   *
   * The three callbacks are optional; if it is not provided, a null function
   * will be executed instead.
   *
   * The three callbacks will be added on top of the existing action
   * attached to the callbacks.
   *
   * @param callbacks { onClick?: (id?: ItemId) => void,
   *                    onHover?: (id?: ItemId) => void,
   *                    onOut?: (id?: ItemId) => void
   *                  }
   */
  public enableObjectAction(callbacks: any): void {
    this.objects.forEach(object => object.activate(callbacks));
  }

  /**
   * Remove interactivity of the objects, i.e remove listeners from the objects.
   */
  public disableObjectAction() {
    this.objects.forEach(object => object.deactivate());
  }

  /**
   * Apply glowing effect around the object.
   *
   * @param objectId id of the object
   */
  public makeObjectGlow(objectId: ItemId, turnOn: boolean) {
    const object = this.objects.get(objectId);
    if (!object) {
      return;
    }
    if (turnOn) {
      (object.sprite as GlowingImage).startGlow();
    } else {
      (object.sprite as GlowingImage).clearGlow();
    }
  }

  /**
   * Apply blinking effect on the object.
   *
   * @param objectId id of the object
   */
  public makeObjectBlink(objectId: ItemId, turnOn: boolean) {
    const object = this.objects.get(objectId);
    if (!object) {
      return;
    }
    if (turnOn) {
      (object.sprite as GlowingImage).startBlink();
    } else {
      (object.sprite as GlowingImage).clearBlink();
    }
  }

  /**
   * Create the object from the given object property.
   * All objects created with this function will have
   * `.activate()` and `.deactivate()`; which is internally used
   * by `.enableObjectActions()` and `.disableObjectActions()`.
   *
   * The method `.activate(callbacks)` receive a callbacks argument,
   * which encapsulate three different callbacks.
   *
   * callbacks = { onClick?: (id?: ItemId) => void,
   *               onHover?: (id?: ItemId) => void,
   *               onOut?: (id?: ItemId) => void
   *             }
   *
   * @param gameManager game manager
   * @param objectProperty object property to be used
   */
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
