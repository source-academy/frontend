import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';

import { Constants } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import GlowingImage from '../effects/GlowingObject';
import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { StateChangeType, StateObserver } from '../state/GameStateTypes';
import { mandatory } from '../utils/GameUtils';
import { ActivatableSprite, ActivateSpriteCallbacks, ObjectProperty } from './GameObjectTypes';

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
  private objects: Map<ItemId, ActivatableSprite>;

  constructor() {
    this.observerId = 'GameObjectManager';
    this.objects = new Map<ItemId, ActivatableSprite>();
  }

  public initialise() {
    GameGlobalAPI.getInstance().subscribeState(this);
  }

  /**
   * Part of observer pattern. Receives notification from GameStateManager.
   *
   * On notify, will rerender objects on the location to reflect
   * the update to the state if applicable.
   *
   * @param changeType type of change
   * @param locationId id of the location being updated
   * @param id id of item being updated
   */
  public notify(changeType: StateChangeType, locationId: LocationId, id?: string) {
    const hasUpdate = GameGlobalAPI.getInstance().hasLocationUpdateAttr(
      locationId,
      GameLocationAttr.objects
    );
    const currLocationId = GameGlobalAPI.getInstance().getCurrLocId();
    if (hasUpdate && locationId === currLocationId) {
      // Inform state manager that update has been consumed
      GameGlobalAPI.getInstance().consumedLocationUpdate(locationId, GameLocationAttr.objects);

      // If the update is on the current location, we rerender to reflect the update
      if (id) {
        // If Id is provided, we only need to address the specific object
        this.handleObjectChange(changeType, id);
      } else {
        // Else, rerender the whole layer
        this.renderObjectsLayerContainer(locationId);
      }
    }
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

    // Refresh mapping
    this.objects.clear();

    // Add all the objects
    objIdsToRender.map(id => this.handleAdd(id));
  }

  /**
   * Allow objects to be interacted with i.e. enable listeners objects.
   *
   * @param {ActivatableSpriteCallbacks} callbacks callbacks to objects
   *                enable them to have extra interactions when clicked
   */
  public enableObjectAction(callbacks: ActivateSpriteCallbacks): void {
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
  ): ActivatableSprite {
    const { assetKey, x, y, width, height, actionIds, interactionId } = objectProperty;
    const object = new GlowingImage(gameManager, x, y, assetKey, width, height);

    function activate({ onClick, onHover, onOut }: ActivateSpriteCallbacks) {
      object.getClickArea().on('pointerup', async () => {
        onClick(interactionId);
        await GameGlobalAPI.getInstance().processGameActions(actionIds);
      });
      object.getClickArea().on('pointerover', () => {
        onHover(interactionId);
      });
      object.getClickArea().on('pointerout', () => {
        onOut(interactionId);
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

  /**
   * Handle change of a specific object ID.
   *
   * @param changeType type of change
   * @param id id of affected object
   */
  private handleObjectChange(changeType: StateChangeType, id: ItemId) {
    switch (changeType) {
      case StateChangeType.Add:
        return this.handleAdd(id);
      case StateChangeType.Mutate:
        return this.handleMutate(id);
      case StateChangeType.Delete:
        return this.handleDelete(id);
    }
  }

  /**
   * Add the object, specified by the ID, into the scene
   * and keep track of it within the mapping.
   *
   * Throws error if the object property is not available
   * in the mapping.
   *
   * @param id id of object
   */
  private handleAdd(id: ItemId) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const objectPropMap = GameGlobalAPI.getInstance().getObjPropertyMap();

    const objectProp = mandatory(objectPropMap.get(id));
    const object = this.createObject(gameManager, objectProp);
    GameGlobalAPI.getInstance().addContainerToLayer(
      Layer.Objects,
      (object.sprite as GlowingImage).getContainer()
    );
    this.objects.set(id, object);

    return object;
  }

  /**
   * Mutate the object of the given id.
   *
   * Internally, will delete and re-add the object with
   * the updated property.
   *
   * @param id id of object
   */
  private handleMutate(id: ItemId) {
    this.handleDelete(id);
    this.handleAdd(id);
  }

  /**
   * Delete the object of the given id, if
   * applicable.
   *
   * @param id id of the object
   */
  private handleDelete(id: ItemId) {
    const object = this.objects.get(id);
    if (object) (object.sprite as GlowingImage).getContainer().destroy();
  }
}

export default GameObjectManager;
