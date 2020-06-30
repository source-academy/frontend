import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId } from '../location/GameMapTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { resize } from '../utils/SpriteUtils';
import { CollectibleProperty } from './CollectiblesTypes';

export default class GameCollectibleRenderer {
  private collectiblesMap: Map<ItemId, CollectibleProperty>;

  constructor() {
    this.collectiblesMap = new Map<ItemId, CollectibleProperty>();
  }

  public initialise(gameManager: GameManager) {
    this.collectiblesMap = gameManager.currentCheckpoint.map.getCollectibles();
  }

  public renderCollectiblesLayerContainer(locationId: LocationId): void {
    GameActionManager.getInstance().clearSeveralLayers([Layer.Collectibles]);
    const collectibleIdsToRender = (
      GameActionManager.getInstance().getLocationAtId(locationId).collectibles || []
    ).filter((collectibleId: ItemId) =>
      GameActionManager.getInstance().existsInUserStateList('collectibles', collectibleId)
    );

    const gameManager = GameActionManager.getInstance().getGameManager();

    collectibleIdsToRender.forEach((id: ItemId) => {
      const collectibleProp = this.collectiblesMap.get(id);
      if (!collectibleProp) {
        return;
      }

      const collectibleSprite = this.createCollectible(gameManager, collectibleProp);

      GameActionManager.getInstance()
        .getGameManager()
        .layerManager.addToLayer(Layer.Collectibles, collectibleSprite);
    });
  }

  private createCollectible(
    gameManager: GameManager,
    collectibleProp: CollectibleProperty
  ): Phaser.GameObjects.Image {
    const { assetKey, x, y, width, height } = collectibleProp;
    const collectibleSprite = new Phaser.GameObjects.Image(gameManager, x, y, assetKey);
    width && resize(collectibleSprite, width, height);
    return collectibleSprite;
  }
}
