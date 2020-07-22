import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';

import { Constants } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { ActivatableSprite } from '../objects/GameObjectTypes';
import { StateChangeType, StateObserver } from '../state/GameStateTypes';
import { BBoxProperty } from './GameBoundingBoxTypes';

/**
 * Manager for rendering interactive bounding boxes in the location.
 */
class GameBoundingBoxManager implements StateObserver {
  public observerId: string;
  private bboxes: Map<ItemId, ActivatableSprite>;

  constructor() {
    this.observerId = 'GameBoundingBoxManager';
    this.bboxes = new Map<ItemId, ActivatableSprite>();
  }

  public initialise() {
    GameGlobalAPI.getInstance().subscribeState(this);
  }

  /**
   * Part of observer pattern. Receives notification from GameStateManager.
   *
   * On notify, will rerender all the bounding boxes on the location to reflect
   * the update to the state if applicable.
   *
   * @param changeType type of change
   * @param locationId id of the location being updated
   * @param id id of item being updated
   */
  public notify(changeType: StateChangeType, locationId: LocationId, id?: string) {
    const hasUpdate = GameGlobalAPI.getInstance().hasLocationUpdateAttr(
      locationId,
      GameLocationAttr.boundingBoxes
    );
    const currLocationId = GameGlobalAPI.getInstance().getCurrLocId();
    if (hasUpdate && locationId === currLocationId) {
      this.renderBBoxLayerContainer(locationId);
    }
  }

  /**
   * Create a container filled with the bounding boxes related to the itemIDs.
   *
   * @param bboxIds bbox IDs to be created
   */
  private createBBoxLayerContainer(bboxIds: ItemId[]): Phaser.GameObjects.Container {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const bboxPropMap = GameGlobalAPI.getInstance().getBBoxPropertyMap();
    const bboxContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    this.bboxes.clear();
    bboxIds
      .map(id => bboxPropMap.get(id))
      .filter(bboxProp => bboxProp !== undefined)
      .map(bboxProp => {
        const bbox = this.createBBox(gameManager, bboxProp!);
        bboxContainer.add(bbox.sprite as Phaser.GameObjects.Rectangle);
        this.bboxes.set(bboxProp!.interactionId, bbox);
        return bbox;
      });

    return bboxContainer;
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
      GameLocationAttr.boundingBoxes,
      locationId
    );
    const bboxContainer = this.createBBoxLayerContainer(bboxIdsToRender);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.BBox, bboxContainer);
  }

  /**
   * Allow objects to be interacted with i.e. add listeners to the bboxes.
   *
   * There are three type of callbacks can be supplied:
   *  - onClick: (ItemId) => void, to be executed when bboxes is clicked
   *  - onHover: (ItemId) => void, to be executed when bboxes is hovered over
   *  - onOut: (ItemId) => void, to be executed when bboxes is out of hover
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
  public enableBBoxAction(callbacks: any): void {
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
   * @param gameManager game manager
   * @param objectProperty object property to be used
   */
  private createBBox(gameManager: GameManager, bboxProperty: BBoxProperty): ActivatableSprite {
    const { x, y, width, height, actionIds, interactionId } = bboxProperty;
    const bboxSprite = new Phaser.GameObjects.Rectangle(gameManager, x, y, width, height, 0, 0);
    if (bboxProperty.isInteractive) {
      bboxSprite.setInteractive();
    }

    function activate({
      onClick = (id?: ItemId) => {},
      onPointerout = (id?: ItemId) => {},
      onHover = (id?: ItemId) => {}
    }) {
      bboxSprite.on('pointerup', async () => {
        onClick(interactionId);
        await GameGlobalAPI.getInstance().processGameActions(actionIds);
      });
      bboxSprite.on('pointerover', () => {
        onHover(interactionId);
      });
      bboxSprite.on('pointerout', () => {
        onPointerout(interactionId);
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
}

export default GameBoundingBoxManager;
