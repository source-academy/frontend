import GameManager from 'src/features/game/scenes/gameManager/GameManager';

import { BBoxProperty, ActivatableBBox } from './GameBoundingBoxTypes';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { StateObserver } from '../state/GameStateTypes';
import { GameMode } from '../mode/GameModeTypes';
import { Constants } from '../commons/CommonConstants';

class GameBoundingBoxManager implements StateObserver {
  public observerId: string;
  private bboxes: ActivatableBBox[];
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.observerId = 'GameBoundingBoxManager';
    this.bboxes = [];
    this.gameManager.getStateManager().subscribe(this);
  }

  public notify(locationId: LocationId) {
    const hasUpdate = this.gameManager
      .getStateManager()
      .hasLocationUpdate(locationId, GameMode.Explore);
    const currLocationId = this.gameManager.currentLocationId;
    if (hasUpdate && locationId === currLocationId) {
      this.renderBBoxLayerContainer(locationId);
    }
  }

  public renderBBoxLayerContainer(locationId: LocationId): void {
    this.gameManager.getLayerManager().clearSeveralLayers([Layer.BBox]);
    const bboxIdsToRender =
      this.gameManager
        .getStateManager()
        .getLocationAttr(GameLocationAttr.boundingBoxes, locationId) || [];
    const bboxContainer = this.createBBoxLayerContainer(bboxIdsToRender);
    this.gameManager.getLayerManager().addToLayer(Layer.BBox, bboxContainer);
  }

  public createBBoxLayerContainer(bboxIds: ItemId[]): Phaser.GameObjects.Container {
    const bboxPropMap = this.gameManager.getStateManager().getBBoxPropertyMap();
    const bboxContainer = new Phaser.GameObjects.Container(this.gameManager, 0, 0);

    this.bboxes = bboxIds
      .map(id => bboxPropMap.get(id))
      .filter(bboxProp => bboxProp !== undefined)
      .map(bboxProp => {
        const bbox = this.createBBox(this.gameManager, bboxProp!);
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
        await gameManager.getActionExecuter().executeStoryActions(actionIds);
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
