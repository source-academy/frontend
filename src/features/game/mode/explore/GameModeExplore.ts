import { IGameUI, ItemId } from '../../commons/CommonsTypes';
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
import GameManager from '../../scenes/gameManager/GameManager';

class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  // Explore Mode does not require states
  public fetchLatestState(): void {}

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = this.gameManager;

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Add back button
    const backButton = new CommonBackButton(
      gameManager,
      () => {
        gameManager.getPhaseManager().popPhase();
        gameManager.getLayerManager().fadeInLayer(Layer.Character, 300);
      },
      0,
      0
    );
    exploreMenuContainer.add(backButton);

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = this.gameManager;

    gameManager.input.setDefaultCursor(magnifyingGlass);

    this.uiContainer = this.getUIContainer();
    this.gameManager.getLayerManager().addToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });

    gameManager.getObjectManager().enableObjectAction({
      onClick: this.explorePointerUp,
      onHover: this.explorePointerOver,
      onPointerout: this.explorePointerOut
    });

    gameManager.getBBoxManager().enableBBoxAction({
      onClick: this.explorePointerUp,
      onHover: this.explorePointerOver,
      onPointerout: this.explorePointerOut
    });

    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = this.gameManager;
    gameManager.input.setDefaultCursor('');
    gameManager.getBBoxManager().disableBBoxAction();
    gameManager.getObjectManager().disableObjectAction();

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

  private explorePointerOver = (id: ItemId) => {
    const hasTriggered = this.gameManager.getStateManager().hasTriggeredInteraction(id);
    if (hasTriggered) {
      this.gameManager.input.setDefaultCursor(magnifyingGlassChecked);
    } else {
      this.gameManager.input.setDefaultCursor(magnifyingGlassHighlight);
    }
  };

  private explorePointerOut = () => {
    this.gameManager.input.setDefaultCursor(magnifyingGlass);
  };

  private explorePointerUp = (id: string) => {
    // Trigger action here
    this.gameManager.getStateManager().triggerInteraction(id);
  };
}

export default GameModeExplore;
