import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { AssetKey } from 'src/features/game/commons/CommonTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { mandatory, toS3Path } from 'src/features/game/utils/GameUtils';

import { loadImage } from '../../game/utils/LoaderUtils';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';

/**
 * This manager manages the background for Story Simulator's Object Placement scene
 * It handles (1) storing of information on the chosen background (2) Rendering background
 */
export default class SSBackgroundManager {
  private backgroundAssetPath: string | undefined;
  private objectPlacement: ObjectPlacement | undefined;
  public x: number;
  public y: number;

  public constructor() {
    this.x = screenCenter.x;
    this.y = screenCenter.y;
  }

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
  }

  /**
   * Loads the background if the chosen file comes from the
   * locations folder
   *
   * And records the short path of the background image
   */
  public async loadBackground() {
    const shortPath = sessionStorage.getItem('selectedAsset');
    if (!shortPath || !shortPath.startsWith('/locations/')) {
      return;
    }
    this.backgroundAssetPath = shortPath;

    const backgroundAssetKey = `!${shortPath}`;
    this.getObjectPlacement().addAsset(backgroundAssetKey, shortPath);

    const assetKeyOnLoad = await loadImage(
      this.getObjectPlacement(),
      backgroundAssetKey,
      toS3Path(shortPath, true)
    );
    this.renderBackground(assetKeyOnLoad);
  }

  private renderBackground(backgroundAssetKey: AssetKey) {
    if (backgroundAssetKey[0] !== '!') {
      return;
    }

    this.getObjectPlacement().getLayerManager().clearLayerContents(Layer.Background);
    const backgroundSprite = new Phaser.GameObjects.Image(
      this.getObjectPlacement(),
      screenCenter.x,
      screenCenter.y,
      backgroundAssetKey
    ).setInteractive();
    this.getObjectPlacement().getLayerManager().addToLayer(Layer.Background, backgroundSprite);
  }

  private getObjectPlacement = () => mandatory(this.objectPlacement);

  public getBackgroundAssetPath() {
    return this.backgroundAssetPath;
  }

  public screenLog() {
    return this.backgroundAssetPath + '\n';
  }
}
