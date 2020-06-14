import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { ObjectProperty } from './GameObjectTypes';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';

class GameObjectManager {
  private objectContainerMap: Map<LocationId, Phaser.GameObjects.Container>;
  private objectPropertyMap: Map<ItemId, ObjectProperty>;

  constructor() {
    this.objectContainerMap = new Map<LocationId, Phaser.GameObjects.Container>();
    this.objectPropertyMap = new Map<ItemId, ObjectProperty>();
  }

  public processObjects(chapter: GameChapter) {
    this.objectPropertyMap = chapter.map.getObjects();
    const locations = chapter.map.getLocations();

    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    locations.forEach(location => {
      const objectContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
      this.objectContainerMap.set(location.name, objectContainer);
      gameManager.add.existing(objectContainer);
    });
  }

  public createObjectsLayerContainer(
    idsToRender: ItemId[],
    locationName: LocationId
  ): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    // Destroy the old container
    this.objectContainerMap.get(locationName)!.destroy();

    const objectContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    idsToRender.forEach(id => {
      const toRenderObjProperty = this.objectPropertyMap.get(id);
      if (toRenderObjProperty) {
        objectContainer.add(this.createObject(gameManager, toRenderObjProperty));
      }
    });

    return objectContainer;
  }

  public renderObjectsLayerContainer(locationName: LocationId): void {
    const hasUpdate = GameActionManager.getInstance().hasLocationUpdate(
      locationName,
      GameMode.Explore
    ); // TODO: Ask Specifically based on Objects Attr
    let objectContainer = this.objectContainerMap.get(locationName);

    // If update, create new object Container
    if (hasUpdate || !objectContainer) {
      const idsToRender =
        GameActionManager.getInstance().getLocationAttr(GameLocationAttr.objects, locationName) ||
        [];
      objectContainer = this.createObjectsLayerContainer(idsToRender, locationName);
      this.objectContainerMap.set(locationName, objectContainer);
    }

    GameActionManager.getInstance().addContainerToLayer(Layer.Objects, objectContainer);
  }

  private createObject(
    gameManager: GameManager,
    objectProperty: ObjectProperty
  ): Phaser.GameObjects.Image {
    const { assetKey, x, y } = objectProperty;
    const objectSprite = new Phaser.GameObjects.Image(gameManager, x, y, assetKey);
    return objectSprite;
  }
}

export default GameObjectManager;
