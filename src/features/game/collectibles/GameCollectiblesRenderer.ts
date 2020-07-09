import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import { resize } from '../utils/SpriteUtils';
import { CollectibleProperty } from './GameCollectiblesTypes';

export default class GameCollectibleRenderer {
  public createCollectible(
    gameManager: GameManager,
    collectibleProp: CollectibleProperty
  ): Phaser.GameObjects.Image {
    const { assetKey, x, y, width, height } = collectibleProp;
    const collectibleSprite = new Phaser.GameObjects.Image(gameManager, x, y, assetKey);
    width && resize(collectibleSprite, width, height);
    return collectibleSprite;
  }
}
