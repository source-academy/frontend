import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import { IGameUI, ItemId } from '../../commons/CommonTypes';
import {
  magnifyingGlass,
  magnifyingGlassChecked,
  magnifyingGlassHighlight
} from './GameModeExploreConstants';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { screenSize } from '../../commons/CommonConstants';
import { sleep } from '../../utils/GameUtils';
import { Layer } from '../../layer/GameLayerTypes';
import CommonBackButton from '../../commons/CommonBackButton';

class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  // Explore Mode does not require states
  public fetchLatestState(): void {}

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Add back button
    const backButton = new CommonBackButton(
      gameManager,
      () => {
        GameGlobalAPI.getInstance().popPhase();
        GameGlobalAPI.getInstance().getGameManager().layerManager.fadeInLayer(Layer.Character, 300);
      },
      0,
      0,
      GameGlobalAPI.getInstance().getGameManager().soundManager
    );
    exploreMenuContainer.add(backButton);

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    gameManager.input.setDefaultCursor(magnifyingGlass);

    this.uiContainer = this.getUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
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
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
      this.uiContainer.destroy();
      this.uiContainer = undefined;
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
    // Trigger action here
    GameGlobalAPI.getInstance().triggerInteraction(id);
  }
}

export default GameModeExplore;
