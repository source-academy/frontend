import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { ItemId } from '../commons/CommonTypes';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import { ActivatableSprite } from '../objects/GameObjectTypes';
import { StateObserver } from '../state/GameStateTypes';
import { BBoxProperty } from './GameBoundingBoxTypes';

/**
 * Manager for rendering interactive bounding boxes in the location.
 */
class GameBoundingBoxManager implements StateObserver {
  private bboxes: Map<ItemId, ActivatableSprite>;

  constructor() {
    this.bboxes = new Map<ItemId, ActivatableSprite>();
    GameGlobalAPI.getInstance().watchGameItemType(GameItemType.boundingBoxes, this);
  }

  /**
   * Clear the layers, and render all the bboxes available to the location.
   * Will immediately be shown on the screen.
   *
   * @param locationId location in which to render bboxes at
   */
  public renderBBoxLayerContainer(locationId: LocationId): void {
    GameGlobalAPI.getInstance().clearSeveralLayers([Layer.BBox]);
    const bboxIdsToRender = GameGlobalAPI.getInstance().getGameItemsInLocation(
      GameItemType.boundingBoxes,
      locationId
    );

    // Refresh mapping
    this.bboxes.clear();

    // Add all the bbox
    bboxIdsToRender.map(id => this.handleAdd(id));
  }

  /**
   * Create the bbox from the given bbox property.
   * All bbox created with this function will have
   * `.activate()` and `.deactivate()`; which is internally used
   * by `.enableBBoxActions()` and `.disableBBoxActions()`.
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
  private createBBox(bboxProperty: BBoxProperty): ActivatableSprite {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const { x, y, width, height, actionIds, interactionId } = bboxProperty;
    const bboxSprite = new Phaser.GameObjects.Rectangle(gameManager, x, y, width, height, 0, 0);
    if (bboxProperty.isInteractive) {
      bboxSprite.setInteractive();
    }

    return {
      sprite: bboxSprite,
      clickArea: bboxSprite,
      actionIds,
      interactionId
    };
  }

  /**
   * Add the bbox, specified by the ID, into the scene
   * and keep track of it within the mapping.
   *
   * Throws error if the bbox property is not available
   * in the mapping.
   *
   * @param id id of bbox
   * @return {boolean} true if successful, false otherwise
   */
  public handleAdd(id: ItemId): boolean {
    const bboxProp = GameGlobalAPI.getInstance().getBBoxById(id);
    const bbox = this.createBBox(bboxProp);
    GameGlobalAPI.getInstance().addContainerToLayer(
      Layer.BBox,
      bbox.sprite as Phaser.GameObjects.Rectangle
    );
    this.bboxes.set(id, bbox);
    return true;
  }

  /**
   * Mutate the bbox of the given id.
   *
   * Internally, will delete and re-add the bbox with
   * the updated property.
   *
   * @param id id of bbox
   * @return {boolean} true if successful, false otherwise
   */
  public handleMutate(id: ItemId): boolean {
    return this.handleDelete(id) && this.handleAdd(id);
  }

  /**
   * Delete the bbox of the given id, if
   * applicable.
   *
   * @param id id of the bbox
   * @return {boolean} true if successful, false otherwise
   */
  public handleDelete(id: ItemId): boolean {
    const bbox = this.bboxes.get(id);
    if (bbox) {
      this.bboxes.delete(id);
      (bbox.sprite as Phaser.GameObjects.Rectangle).destroy();
      return true;
    }
    return false;
  }

  /**
   * Get all the sprites which can be activated
   */
  public getActivatables() {
    return Array.from(this.bboxes.values());
  }
}

export default GameBoundingBoxManager;
