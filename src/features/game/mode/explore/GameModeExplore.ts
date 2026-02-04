import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import SoundAssets from '../../assets/SoundAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { Constants, screenSize } from '../../commons/CommonConstants';
import { IGameUI, ItemId } from '../../commons/CommonTypes';
import { fadeAndDestroy } from '../../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { Layer } from '../../layer/GameLayerTypes';
import { ActivatableSprite } from '../../objects/GameObjectTypes';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { sleep } from '../../utils/GameUtils';
import ExploreModeConstants from './GameModeExploreConstants';

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

    const backButton = new CommonBackButton(
      gameManager,
      async () => await GameGlobalAPI.getInstance().swapPhase(GamePhaseType.Menu)
    );
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
    GameGlobalAPI.getInstance().addToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    this.enableInteractions();

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });

    // Change default icon
    GameGlobalAPI.getInstance().setDefaultCursor(ExploreModeConstants.normal);
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
    GameGlobalAPI.getInstance().setDefaultCursor(Constants.defaultCursor);

    this.disableInteractions();

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
   * This function enables all the activatable sprites (objects/bboxes)
   * that are currently being rendered on the map to have mouse events
   *
   * It changes the default cursor of the hover/click to a magnifying glass
   * It also adds enables the activatable's actions to be played when clicked
   */
  private enableInteractions() {
    GameGlobalAPI.getInstance()
      .getAllActivatables()
      .forEach((activatable: ActivatableSprite) => {
        if (!activatable.actionIds || !activatable.actionIds.length) {
          return;
        }

        activatable.clickArea.on('pointerout', () =>
          this.explorePointerOut(activatable.interactionId)
        );
        activatable.clickArea.on('pointerover', () =>
          this.explorePointerOver(activatable.interactionId)
        );
        activatable.clickArea.on('pointerup', async () => {
          this.explorePointerUp(activatable.interactionId);
          await GameGlobalAPI.getInstance().processGameActions(activatable.actionIds);
        });
      });
  }

  /**
   * This function disables all the activatable sprites (objects/bboxes)
   * that are currently being rendered on the map
   */
  private disableInteractions() {
    GameGlobalAPI.getInstance()
      .getAllActivatables()
      .forEach((activatable: ActivatableSprite) => {
        activatable.clickArea.off('pointerout');
        activatable.clickArea.off('pointerover');
        activatable.clickArea.off('pointerup');
      });
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
    const hasTriggered = GameGlobalAPI.getInstance().hasTriggeredInteraction(id);
    GameGlobalAPI.getInstance().objectHoverGlow(id, true);

    if (hasTriggered) {
      GameGlobalAPI.getInstance().setDefaultCursor(ExploreModeConstants.checked);
    } else {
      GameGlobalAPI.getInstance().setDefaultCursor(ExploreModeConstants.hover);
    }
  }

  /**
   * Function to be executed when user off hover upon interactable object/bbox.
   * It sets the cursor back to 'Explore' mode cursor.
   */
  private explorePointerOut(id: ItemId) {
    GameGlobalAPI.getInstance().setDefaultCursor(ExploreModeConstants.normal);
    GameGlobalAPI.getInstance().objectHoverGlow(id, false);
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
    GameGlobalAPI.getInstance().setDefaultCursor(Constants.defaultCursor);
    GameGlobalAPI.getInstance().objectHoverGlow(id, false);
    GameGlobalAPI.getInstance().triggerInteraction(id);
    GameGlobalAPI.getInstance().setDefaultCursor(ExploreModeConstants.normal);
  }
}

export default GameModeExplore;
