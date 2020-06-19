import GameActionManager from 'src/features/game/action/GameActionManager';
import { IGameUI, ItemId } from '../../commons/CommonsTypes';
import {
  magnifyingGlass,
  magnifyingGlassChecked,
  magnifyingGlassHighlight
} from './GameModeExploreConstants';
import { getBackToMenuContainer } from '../GameModeHelper';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { screenSize } from '../../commons/CommonConstants';
import { sleep } from '../../utils/GameUtils';
import { LocationId } from '../../location/GameMapTypes';
import { Layer } from '../../layer/GameLayerTypes';
import { GameChapter } from '../../chapter/GameChapterTypes';

class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private locationId: LocationId;

  constructor(chapter: GameChapter, locationId: LocationId) {
    this.uiContainer = undefined;
    this.locationId = locationId;
  }

  // Explore Mode does not require states
  public fetchLatestState(): void {}

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    exploreMenuContainer.add(getBackToMenuContainer());

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    this.uiContainer = await this.getUIContainer();
    GameActionManager.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });

    gameManager.objectManager.enableObjectActions(this.locationId);
    this.attachExploreModeCallbacks();
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    gameManager.input.setDefaultCursor('');
    gameManager.objectManager.disableObjectActions();
    this.removeExploreModeCallbacks();

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

  private attachExploreModeCallbacks() {
    // Objects
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
      this.explorePointerOver
    );
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
      this.explorePointerOut
    );
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
      this.explorePointerUp
    );

    // BBoxes
    GameActionManager.getInstance().addInteractiveBBoxListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
      this.explorePointerOver
    );
    GameActionManager.getInstance().addInteractiveBBoxListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
      this.explorePointerOut
    );
    GameActionManager.getInstance().addInteractiveBBoxListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
      this.explorePointerUp
    );
  }

  private removeExploreModeCallbacks() {
    // Objects
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER
    );
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT
    );
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP
    );

    // BBoxes
    GameActionManager.getInstance().removeInteractiveBBoxListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER
    );
    GameActionManager.getInstance().removeInteractiveBBoxListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT
    );
    GameActionManager.getInstance().removeInteractiveBBoxListeners(
      this.locationId,
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
