import { defaultLayerSequence, LayerType } from './LayerTypes';
import { fadeIn, fadeAndDestroy } from '../utils/GameEffects';
import { Constants as c } from '../commons/CommonConstants';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';
import { sleep } from '../utils/GameUtils';

type Container = Phaser.GameObjects.Container;
type GameObject = Phaser.GameObjects.GameObject;
const { Container } = Phaser.GameObjects;

class LayerManager {
  private mainLayer: Phaser.GameObjects.Container | undefined;
  private layers: Map<LayerType, Container>;

  constructor() {
    this.mainLayer = undefined;
    this.layers = new Map<LayerType, Container>();
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

  public getLayer(layerType: LayerType) {
    return this.layers.get(layerType);
  }

  public hideLayer(layerType: LayerType) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(false);
  }

  public showLayer(layerType: LayerType) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(true);
  }

  public async fadeInLayer(layerType: LayerType, fadeDuration = c.fadeDuration) {
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

  public addToLayer(layerType: LayerType, gameObject: GameObject) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    layerContainer.add(gameObject);
  }

  public clearLayerContents(layerType: LayerType, withFade = false) {
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

export default LayerManager;
