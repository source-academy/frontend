import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { ObjectProperty } from './GameObjectTypes';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { StateObserver } from '../state/GameStateTypes';
import { GameMode } from '../mode/GameModeTypes';
import { Constants } from '../commons/CommonConstants';
import { resize } from '../utils/SpriteUtils';
import { ActivatableObject } from './GameObjectTypes';

class GameObjectManager implements StateObserver {
  public observerId: string;
  private objects: ActivatableObject[];

  constructor() {
    this.observerId = 'GameObjectManager';
    this.objects = [];
  }

  public initialise() {
    GameActionManager.getInstance().subscribeState(this);
  }

  public notify(locationId: LocationId) {
    const hasUpdate = GameActionManager.getInstance().hasLocationUpdate(
      locationId,
      GameMode.Explore
    );
    const currLocationId = GameActionManager.getInstance().getGameManager().currentLocationId;
    if (hasUpdate && locationId === currLocationId) {
      this.renderObjectsLayerContainer(locationId);
    }
  }

  public createObjectsLayerContainer(objectIds: ItemId[]): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const objectPropMap = GameActionManager.getInstance().getObjPropertyMap();
    const objectContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    this.objects = objectIds
      .map(id => objectPropMap.get(id))
      .filter(objectProp => objectProp !== undefined)
      .map(objectProp => {
        const object = this.createObject(gameManager, objectProp!);
        objectContainer.add(object.sprite);
        return object;
      });

    return objectContainer;
  }

  public renderObjectsLayerContainer(locationId: LocationId): void {
    GameActionManager.getInstance().clearSeveralLayers([Layer.Objects]);
    const objIdsToRender =
      GameActionManager.getInstance().getLocationAttr(GameLocationAttr.objects, locationId) || [];

    const objectContainer = this.createObjectsLayerContainer(objIdsToRender);

    GameActionManager.getInstance().addContainerToLayer(Layer.Objects, objectContainer);
  }

  public enableObjectAction(callbacks: any): void {
    this.objects.forEach(object => object.activate(callbacks));
  }

  public disableObjectAction() {
    this.objects.forEach(object => object.deactivate());
  }

  private createObject(
    gameManager: GameManager,
    objectProperty: ObjectProperty
  ): ActivatableObject {
    const { assetKey, x, y, width, height, actionIds, interactionId } = objectProperty;
    const object = new Phaser.GameObjects.Image(gameManager, x, y, assetKey).setInteractive({
      pixelPerfect: true
    });
    width && resize(object, width, height);

    function activate({
      onClick = (id?: ItemId) => {},
      onPointerout = (id?: ItemId) => {},
      onHover = (id?: ItemId) => {}
    }) {
      object.on('pointerup', async () => {
        onClick(interactionId);
        await GameActionManager.getInstance().executeStoryAction(actionIds);
      });
      object.on('pointerover', () => {
        onHover(interactionId);
      });
      object.on('pointerout', () => {
        onPointerout(interactionId);
      });
    }

    function deactivate() {
      object.off('pointerup');
      object.off('pointerover');
      object.off('pointerout');
    }

    return {
      sprite: object,
      activate: actionIds ? activate : Constants.nullFunction,
      deactivate
    };
  }
}

export default GameObjectManager;
