import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { Constants } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import { ActivatableSprite, ActivateSpriteCallbacks } from '../objects/GameObjectTypes';
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
    const bboxIdsToRender = GameGlobalAPI.getInstance().getLocationAttr(
      GameItemType.boundingBoxes,
      locationId
    );

    // Refresh mapping
    this.bboxes.clear();

    // Add all the bbox
    bboxIdsToRender.map(id => this.handleAdd(id));
  }

  /**
   * Allow objects to be interacted with i.e. enable listeners objects.
   *
   * @param {ActivateSpriteCallbacks} callbacks callbacks to objects
   *                enable them to have extra interactions when clicked
   */
  public enableBBoxAction(callbacks: ActivateSpriteCallbacks): void {
    this.bboxes.forEach(bbox => bbox.activate(callbacks));
  }

  /**
   * Remove interactivity of the bboxes, i.e remove listeners from the bboxes.
   */
  public disableBBoxAction() {
    this.bboxes.forEach(bbox => bbox.deactivate());
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

    function activate({ onClick, onHover, onOut }: ActivateSpriteCallbacks) {
      bboxSprite.on('pointerup', async () => {
        onClick(interactionId);
        await GameGlobalAPI.getInstance().processGameActions(actionIds);
      });
      bboxSprite.on('pointerover', () => {
        onHover(interactionId);
      });
      bboxSprite.on('pointerout', () => {
        onOut(interactionId);
      });
    }

    function deactivate() {
      bboxSprite.off('pointerup');
      bboxSprite.off('pointerover');
      bboxSprite.off('pointerout');
    }

    return {
      sprite: bboxSprite,
      activate: actionIds ? activate : Constants.nullFunction,
      deactivate
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
   */
  public handleAdd(id: ItemId) {
    const bboxProp = GameGlobalAPI.getInstance().getBBoxById(id);
    const bbox = this.createBBox(bboxProp);
    GameGlobalAPI.getInstance().addContainerToLayer(
      Layer.BBox,
      bbox.sprite as Phaser.GameObjects.Rectangle
    );
    this.bboxes.set(id, bbox);
    return bbox;
  }

  /**
   * Mutate the bbox of the given id.
   *
   * Internally, will delete and re-add the bbox with
   * the updated property.
   *
   * @param id id of bbox
   */
  public handleMutate(id: ItemId) {
    if (this.handleDelete(id)) {
      this.handleAdd(id);
    }
  }

  /**
   * Delete the bbox of the given id, if
   * applicable.
   *
   * @param id id of the bbox
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
}

export default GameBoundingBoxManager;
