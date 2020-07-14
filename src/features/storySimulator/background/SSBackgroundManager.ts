import { Constants, screenCenter } from 'src/features/game/commons/CommonConstants';
import { AssetKey } from 'src/features/game/commons/CommonTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { mandatory } from 'src/features/game/utils/GameUtils';

import { loadImage } from '../../game/utils/LoaderUtils';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';

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
      Constants.assetsFolder + shortPath
    );
    this.renderBackground(assetKeyOnLoad);
  }

  private renderBackground(backgroundAssetKey: AssetKey) {
    if (backgroundAssetKey[0] !== '!') {
      return;
    }

    this.getObjectPlacement().layerManager.clearLayerContents(Layer.Background);
    const backgroundSprite = new Phaser.GameObjects.Image(
      this.getObjectPlacement(),
      screenCenter.x,
      screenCenter.y,
      backgroundAssetKey
    ).setInteractive();
    this.getObjectPlacement().layerManager.addToLayer(Layer.Background, backgroundSprite);
  }

  private getObjectPlacement = () => mandatory(this.objectPlacement) as ObjectPlacement;

  public getBackgroundAssetPath() {
    return this.backgroundAssetPath;
  }

  public screenLog() {
    return this.backgroundAssetPath + '\n';
  }
}
