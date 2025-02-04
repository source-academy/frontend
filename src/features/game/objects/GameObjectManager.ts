import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { ItemId } from '../commons/CommonTypes';
import GlowingImage from '../effects/GlowingObject';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import { StateObserver } from '../state/GameStateTypes';
import { ActivatableSprite, ObjectProperty } from './GameObjectTypes';

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
    const objIdsToRender = GameGlobalAPI.getInstance().getGameItemsInLocation(
      GameItemType.objects,
      locationId
    );

    // Refresh mapping
    this.objects.clear();

    // Add all the objects
    objIdsToRender.map(id => this.handleAdd(id));
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
   * Apply glow effect on the object, for when it's hovered on
   *
   * @param objectId id of the object
   */
  public objectHoverGlow(objectId: ItemId, turnOn: boolean) {
    const object = this.objects.get(objectId);
    if (!object) {
      return;
    }
    if (turnOn) {
      (object.sprite as GlowingImage).hoverGlowStart();
    } else {
      (object.sprite as GlowingImage).hoverGlowEnd();
    }
  }

  /**
   * Create the object from the given object property.
   * Because we want this sprite to be activatable
   * by Explore Mode UI, we expose its actionIds
   * and interactionId
   *
   * @param objectProperty object property to be used
   */
  private createObject(objectProperty: ObjectProperty): ActivatableSprite {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const { assetKey, x, y, width, height, actionIds, interactionId } = objectProperty;
    const object = new GlowingImage(gameManager, x, y, assetKey, width, height);

    return {
      sprite: object,
      clickArea: object.getClickArea(),
      actionIds,
      interactionId
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
    GameGlobalAPI.getInstance().addToLayer(
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

  /**
   * Get all the rectanlge sprites which can be activated
   * by external Explore Mode UI
   */
  public getActivatables() {
    return Array.from(this.objects.values());
  }
}

export default GameObjectManager;
