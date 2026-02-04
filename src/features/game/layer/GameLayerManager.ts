import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { Constants } from '../commons/CommonConstants';
import { fadeIn, fadeOut } from '../effects/FadeEffect';
import { sleep } from '../utils/GameUtils';
import { defaultLayerSequence, Layer } from './GameLayerTypes';

/**
 * Manager in charge of placing ordering the layers
 * as specified in Game Layer types
 */
class GameLayerManager {
  private layers: Map<Layer, Phaser.GameObjects.Container>;

  constructor(scene: Phaser.Scene) {
    this.layers = new Map(
      defaultLayerSequence.map(layer => [layer, new Phaser.GameObjects.Container(scene, 0, 0)])
    );
    this.layers.forEach(layer => scene.add.existing(layer));
  }

  /**
   * Return a specific layer's container.
   *
   * @param layerType layer type to return
   */
  public getLayer(layerType: Layer) {
    return this.layers.get(layerType);
  }

  /**
   * Hide a specific layer.
   *
   * @param layerType layer type to hide
   */
  public hideLayer(layerType: Layer) {
    const layerToHide = this.layers.get(layerType);
    layerToHide?.setVisible(false);
    layerToHide?.setAlpha(0);
  }

  /**
   * Show a specific layer.
   *
   * @param layerType layer to show
   */
  public showLayer(layerType: Layer) {
    const layerToShow = this.layers.get(layerType);
    layerToShow?.setVisible(true);
    layerToShow?.setAlpha(1);
  }

  /**
   * Fade in a specific layer.
   *
   * @param layerType layer to fade in
   * @param fadeDuration duration of fade
   */
  public async fadeInLayer(layerType: Layer, fadeDuration = Constants.fadeDuration) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const layerToFadeIn = this.layers.get(layerType)!;

    layerToFadeIn.setVisible(true);
    layerToFadeIn.setAlpha(0);
    gameManager.tweens.add(fadeIn([layerToFadeIn], fadeDuration));
    await sleep(fadeDuration);
  }

  /**
   * Fade out a specific layer.
   *
   * @param layerType layer to fade out
   * @param fadeDuration duration of fade
   */
  public async fadeOutLayer(layerType: Layer, fadeDuration = Constants.fadeDuration) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const layerToFadeOut = this.layers.get(layerType)!;

    layerToFadeOut.setVisible(true);
    layerToFadeOut.setAlpha(1);
    gameManager.tweens.add(fadeOut([layerToFadeOut], fadeDuration));
    await sleep(fadeDuration);
  }

  /**
   * Add a game object to the specified layer.
   *
   * @param layerType layer to be added to
   * @param gameObject game object to add
   */
  public addToLayer(layerType: Layer, gameObject: Phaser.GameObjects.GameObject) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    layerContainer.add(gameObject);
  }

  /**
   * Clear, by destroying, the content of several layers.
   *
   * NOTE: This will cause any references to the content within the layers
   * also point to a destroyed game object.
   *
   * @param layerTypes layers to clear from
   */
  public clearSeveralLayers(layerTypes: Layer[]) {
    layerTypes.forEach(layerType => this.clearLayerContents(layerType));
  }

  /**
   * Clear, by destroying, the content of all layers.
   *
   * NOTE: This will cause any references to the content within the layers
   * also point to a destroyed game object.
   */
  public clearAllLayers() {
    this.layers.forEach((_, layerType) => this.clearLayerContents(layerType));
  }

  /**
   * Clear, by destroying, the content of a layer.
   *
   * NOTE: This will cause any references to the content within the layers
   * also point to a destroyed game object.
   *
   * @param layerType layer to clear from
   */
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
