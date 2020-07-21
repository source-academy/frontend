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

  /**
   * Create the container that encapsulate the 'Explore' mode UI,
   * i.e. the back button.
   */
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

  /**
   * Activate the 'Explore' mode UI.
   *
   * Usually only called by the phase manager when 'Explore' phase is
   * pushed.
   */
  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });

    // Activate objects action and make them interactable
    GameGlobalAPI.getInstance().enableObjectAction({
      onClick: this.explorePointerUp,
      onHover: this.explorePointerOver,
      onPointerout: this.explorePointerOut
    });

    // Activate bbox action and make them itneractable
    GameGlobalAPI.getInstance().enableBBoxAction({
      onClick: this.explorePointerUp,
      onHover: this.explorePointerOver,
      onPointerout: this.explorePointerOut
    });

    // Change default icon
    gameManager.input.setDefaultCursor(magnifyingGlass);
    GameGlobalAPI.getInstance().playSound(SoundAssets.modeEnter.key);
  }

  /**
   * Deactivate the 'Explore' mode UI.
   *
   * Usually only called by the phase manager when 'Explore' phase is
   * transitioned out.
   */
  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    // Reset the cursor
    gameManager.input.setDefaultCursor('');

    // Disable objects and bbox action, should not be interactable
    // outside Explore mode
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

  /**
   * Function to be executed when user hover upon interactable object/bbox.
   * It sets the cursor to different icons based on wheter user has ever
   * interacted with it previously.
   *
   * @param id id of the object, to be used to check whether it has been
   *           triggered before
   */
  private explorePointerOver(id: ItemId) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const hasTriggered = GameGlobalAPI.getInstance().hasTriggeredInteraction(id);
    if (hasTriggered) {
      gameManager.input.setDefaultCursor(magnifyingGlassChecked);
    } else {
      gameManager.input.setDefaultCursor(magnifyingGlassHighlight);
    }
  }

  /**
   * Function to be executed when user off hover upon interactable object/bbox.
   * It sets the cursor back to 'Explore' mode cursor.
   */
  private explorePointerOut() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  /**
   * Function to be executed when user click on the interatable object/bbox.
   *
   * It will prompt GameStateManager to record that this interaction has
   * been triggered.
   *
   * @param id id of the object, to be used to inform GameStateManager
   */
  private explorePointerUp(id: string) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    gameManager.input.setDefaultCursor('');
    GameGlobalAPI.getInstance().triggerInteraction(id);
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }
}

export default GameModeExplore;
