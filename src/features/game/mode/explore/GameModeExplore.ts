import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import SoundAssets from '../../assets/SoundAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenSize } from '../../commons/CommonConstants';
import { IGameUI, ItemId } from '../../commons/CommonTypes';
import { fadeAndDestroy } from '../../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { Layer } from '../../layer/GameLayerTypes';
import { sleep } from '../../utils/GameUtils';
import {
  magnifyingGlass,
  magnifyingGlassChecked,
  magnifyingGlassHighlight
} from './GameModeExploreConstants';

/**
 * The class in charge of showing "Explore" mode UI
 * which comprises back button, attaching magnifying glass cursor and
 * making objects and bounding boxes active during Explore mode
 */
class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  public createUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const backButton = new CommonBackButton(gameManager, () => {
      GameGlobalAPI.getInstance().popPhase();
      GameGlobalAPI.getInstance().fadeInLayer(Layer.Character, 300);
    });
    exploreMenuContainer.add(backButton);
    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });

    GameGlobalAPI.getInstance().enableObjectAction({
      onClick: this.explorePointerUp,
      onHover: this.explorePointerOver,
      onPointerout: this.explorePointerOut
    });

    GameGlobalAPI.getInstance().enableBBoxAction({
      onClick: this.explorePointerUp,
      onHover: this.explorePointerOver,
      onPointerout: this.explorePointerOut
    });

    gameManager.input.setDefaultCursor(magnifyingGlass);
    GameGlobalAPI.getInstance().playSound(SoundAssets.modeEnter.key);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    gameManager.input.setDefaultCursor('');
    GameGlobalAPI.getInstance().disableBBoxAction();
    GameGlobalAPI.getInstance().disableObjectAction();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      fadeAndDestroy(gameManager, this.uiContainer);
    }
  }

  private explorePointerOver(id: ItemId) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const hasTriggered = GameGlobalAPI.getInstance().hasTriggeredInteraction(id);
    if (hasTriggered) {
      gameManager.input.setDefaultCursor(magnifyingGlassChecked);
    } else {
      gameManager.input.setDefaultCursor(magnifyingGlassHighlight);
    }
  }

  private explorePointerOut() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  private explorePointerUp(id: string) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    gameManager.input.setDefaultCursor('');
    GameGlobalAPI.getInstance().triggerInteraction(id);
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }
}

export default GameModeExplore;
