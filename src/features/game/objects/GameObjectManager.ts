import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { Constants } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import GlowingImage from '../effects/GlowingObject';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import { StateObserver } from '../state/GameStateTypes';
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
  private objects: Map<ItemId, ActivatableSprite>;

  constructor() {
    this.objects = new Map<ItemId, ActivatableSprite>();
    GameGlobalAPI.getInstance().watchGameItemType(GameItemType.objects, this);
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
      GameItemType.objects,
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
   * @param objectProperty object property to be used
   */
  private createObject(objectProperty: ObjectProperty): ActivatableSprite {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
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
   * Add the object, specified by the ID, into the scene
   * and keep track of it within the mapping.
   *
   * @param id id of object
   * @return {boolean} true if successful, false otherwise
   */
  public handleAdd(id: ItemId): boolean {
    const objectProp = GameGlobalAPI.getInstance().getObjectById(id);
    const object = this.createObject(objectProp);
    GameGlobalAPI.getInstance().addContainerToLayer(
      Layer.Objects,
      (object.sprite as GlowingImage).getContainer()
    );
    this.objects.set(id, object);
    return true;
  }

  /**
   * Mutate the object of the given id.
   *
   * Internally, will delete and re-add the object with
   * the updated property.
   *
   * @param id id of object
   * @return {boolean} true if successful, false otherwise
   */
  public handleMutate(id: ItemId): boolean {
    return this.handleDelete(id) && this.handleAdd(id);
  }

  /**
   * Delete the object of the given id, if
   * applicable.
   *
   * @param id id of the object
   * @return {boolean} true if successful, false otherwise
   */
  public handleDelete(id: ItemId): boolean {
    const object = this.objects.get(id);
    if (object) {
      this.objects.delete(id);
      (object.sprite as GlowingImage).getContainer().destroy();
      return true;
    }
    return false;
  }
}

export default GameObjectManager;
