import { defaultLayerSequence, Layer } from './GameLayerTypes';
import { fadeIn, fadeOut } from '../effects/FadeEffect';
import { Constants } from '../commons/CommonConstants';
import { sleep } from '../utils/GameUtils';

class GameLayerManager {
  private mainLayer: Phaser.GameObjects.Container | undefined;
  private layers: Map<Layer, Phaser.GameObjects.Container>;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.mainLayer = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.layers = new Map(
      defaultLayerSequence.map(layerType => {
        return [layerType, new Phaser.GameObjects.Container(this.scene, 0, 0)];
      })
    );
    this.mainLayer.add(Array.from(this.layers.values()));
    this.scene.add.existing(this.mainLayer);
  }

  public getLayer(layerType: Layer) {
    return this.layers.get(layerType);
  }

  public hideLayer(layerType: Layer) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(false) && layerToHide.setAlpha(0);
  }

  public showLayer(layerType: Layer) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(true) && layerToHide.setAlpha(1);
  }

  public async fadeInLayer(layerType: Layer, fadeDuration = Constants.fadeDuration) {
    const layerToFadeIn = this.layers.get(layerType)!;

    layerToFadeIn.setAlpha(0);
    this.scene.tweens.add(fadeIn([layerToFadeIn], fadeDuration));
    sleep(fadeDuration);
  }

  public async fadeOutLayer(layerType: Layer, fadeDuration = Constants.fadeDuration) {
    const layerToFadeOut = this.layers.get(layerType)!;

    layerToFadeOut.setAlpha(1);
    this.scene.tweens.add(fadeOut([layerToFadeOut], fadeDuration));
    sleep(fadeDuration);
  }

  public addToLayer(layerType: Layer, gameObject: Phaser.GameObjects.GameObject) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    layerContainer.add(gameObject);
  }

  public clearSeveralLayers(layerTypes: Layer[], withFade = false) {
    layerTypes.forEach(layerType => this.clearLayerContents(layerType));
  }

  public clearAllLayers() {
    this.layers.forEach((_, layerType) => this.clearLayerContents(layerType));
  }

  public clearLayerContents(layerType: Layer) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    while (layerContainer.list.length) {
      layerContainer.list[0].destroy();
    }
  }
}

export default GameLayerManager;
