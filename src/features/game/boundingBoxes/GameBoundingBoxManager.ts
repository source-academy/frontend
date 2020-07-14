import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';

import { Constants } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import { GameLocationAttr,LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { StateObserver } from '../state/GameStateTypes';
import { ActivatableBBox,BBoxProperty } from './GameBoundingBoxTypes';

class GameBoundingBoxManager implements StateObserver {
  public observerId: string;
  private bboxes: ActivatableBBox[];

  constructor() {
    this.observerId = 'GameBoundingBoxManager';
    this.bboxes = [];
  }

  public initialise() {
    GameGlobalAPI.getInstance().subscribeState(this);
  }

  public notify(locationId: LocationId) {
    const hasUpdate = GameGlobalAPI.getInstance().hasLocationUpdate(locationId, GameMode.Explore);
    const currLocationId = GameGlobalAPI.getInstance().getCurrLocId();
    if (hasUpdate && locationId === currLocationId) {
      this.renderBBoxLayerContainer(locationId);
    }
  }

  public renderBBoxLayerContainer(locationId: LocationId): void {
    GameGlobalAPI.getInstance().clearSeveralLayers([Layer.BBox]);
    const bboxIdsToRender = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.boundingBoxes,
      locationId
    );
    const bboxContainer = this.createBBoxLayerContainer(bboxIdsToRender);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.BBox, bboxContainer);
  }

  public createBBoxLayerContainer(bboxIds: ItemId[]): Phaser.GameObjects.Container {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const bboxPropMap = GameGlobalAPI.getInstance().getBBoxPropertyMap();
    const bboxContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    this.bboxes = bboxIds
      .map(id => bboxPropMap.get(id))
      .filter(bboxProp => bboxProp !== undefined)
      .map(bboxProp => {
        const bbox = this.createBBox(gameManager, bboxProp!);
        bboxContainer.add(bbox.sprite);
        return bbox;
      });

    return bboxContainer;
  }

  public enableBBoxAction(callbacks: any): void {
    this.bboxes.forEach(bbox => bbox.activate(callbacks));
  }

  public disableBBoxAction() {
    this.bboxes.forEach(bbox => bbox.deactivate());
  }

  private createBBox(gameManager: GameManager, bboxProperty: BBoxProperty): ActivatableBBox {
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
