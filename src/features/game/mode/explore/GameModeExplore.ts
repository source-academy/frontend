import GameActionManager from 'src/features/game/action/GameActionManager';
import { IGameUI, ItemId } from '../../commons/CommonsTypes';
import { LocationId } from '../../location/GameMapTypes';
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
    const gameManager = GameActionManager.getInstance().getGameManager();

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Add back button
    const backButton = new CommonBackButton(
      gameManager,
      () => GameActionManager.getInstance().getGameManager().phaseManager.popPhase(),
      0,
      0
    );
    exploreMenuContainer.add(backButton);

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    gameManager.input.setDefaultCursor(magnifyingGlass);

    this.uiContainer = this.getUIContainer();
    GameActionManager.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });

    const locationId = GameActionManager.getInstance().getCurrLocId();
    gameManager.objectManager.enableObjectActions(locationId);
    gameManager.boundingBoxManager.enableBBoxActions(locationId);

    this.attachExploreModeCallbacks(locationId);
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    gameManager.input.setDefaultCursor('');
    gameManager.objectManager.disableObjectActions();
    gameManager.boundingBoxManager.disableBBoxActions();
    this.removeExploreModeCallbacks(gameManager.currentLocationId);

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

  private attachExploreModeCallbacks(locationId: LocationId) {
    // Objects
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
      this.explorePointerOver
    );
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
      this.explorePointerOut
    );
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
      this.explorePointerUp
    );

    // BBoxes
    GameActionManager.getInstance().addInteractiveBBoxListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
      this.explorePointerOver
    );
    GameActionManager.getInstance().addInteractiveBBoxListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
      this.explorePointerOut
    );
    GameActionManager.getInstance().addInteractiveBBoxListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
      this.explorePointerUp
    );
  }

  private removeExploreModeCallbacks(locationId: LocationId) {
    // Objects
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER
    );
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT
    );
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP
    );

    // BBoxes
    GameActionManager.getInstance().removeInteractiveBBoxListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER
    );
    GameActionManager.getInstance().removeInteractiveBBoxListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT
    );
    GameActionManager.getInstance().removeInteractiveBBoxListeners(
      locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP
    );
  }

  private explorePointerOver(id: ItemId) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const hasTriggered = GameActionManager.getInstance().hasTriggeredInteraction(id);
    if (hasTriggered) {
      gameManager.input.setDefaultCursor(magnifyingGlassChecked);
    } else {
      gameManager.input.setDefaultCursor(magnifyingGlassHighlight);
    }
  }

  private explorePointerOut() {
    const gameManager = GameActionManager.getInstance().getGameManager();
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  private explorePointerUp(id: string) {
    // Trigger action here
    GameActionManager.getInstance().triggerInteraction(id);
  }
}

export default GameModeExplore;
