import { defaultLayerSequence, Layer } from './GameLayerTypes';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';
import { Constants } from '../commons/CommonConstants';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { sleep } from '../utils/GameUtils';

type Container = Phaser.GameObjects.Container;
type GameObject = Phaser.GameObjects.GameObject;
const { Container } = Phaser.GameObjects;

class GameLayerManager {
  private mainLayer: Phaser.GameObjects.Container | undefined;
  private layers: Map<Layer, Container>;

  constructor() {
    this.mainLayer = undefined;
    this.layers = new Map<Layer, Container>();
  }

  public initialiseMainLayer(scene: Phaser.Scene) {
    this.mainLayer = new Phaser.GameObjects.Container(scene, 0, 0);
    scene.add.existing(this.mainLayer);
    for (const layerType of defaultLayerSequence) {
      const layerContainer = new Container(scene, 0, 0);
      this.layers.set(layerType, layerContainer);
      this.mainLayer.add(layerContainer);
    }
  }

  public getLayer(layerType: Layer) {
    return this.layers.get(layerType);
  }

  public hideLayer(layerType: Layer) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(false);
  }

  public showLayer(layerType: Layer) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(true);
  }

  public async fadeInLayer(layerType: Layer, fadeDuration = Constants.fadeDuration) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      return;
    }
    const layerToFadeIn = this.layers.get(layerType);

    if (!layerToFadeIn) {
      return;
    }
    layerToFadeIn.setAlpha(0);
    gameManager.tweens.add(fadeIn([layerToFadeIn], fadeDuration));
    sleep(fadeDuration);
  }

  public addToLayer(layerType: Layer, gameObject: GameObject) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    layerContainer.add(gameObject);
  }

  public clearSeveralLayers(layerTypes: Layer[], withFade = false) {
    layerTypes.forEach(layerType => this.clearLayerContents(layerType, withFade));
  }

  public clearLayerContents(layerType: Layer, withFade = false) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      return;
    }
    if (withFade) {
      layerContainer.list.map((gameObject: GameObject) => fadeAndDestroy(gameManager, gameObject));
    } else {
      layerContainer.list.map((gameObject: GameObject) => gameObject.destroy());
    }
  }
}

export default GameLayerManager;
