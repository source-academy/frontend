import GameActionManager from 'src/features/game/action/GameActionManager';
import { IGameUI, ItemId } from '../../commons/CommonsTypes';
import { BBoxProperty } from '../../boundingBoxes/BoundingBoxTypes';
import {
  magnifyingGlass,
  magnifyingGlassChecked,
  magnifyingGlassHighlight
} from './GameModeExploreConstants';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { screenSize } from '../../commons/CommonConstants';
import { sleep } from '../../utils/GameUtils';

class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private locationName: string;
  private bboxIds: ItemId[];
  private boundingBoxes: Map<ItemId, BBoxProperty>;

  constructor(locationName: string, bboxIds?: ItemId[], boundingBoxes?: Map<ItemId, BBoxProperty>) {
    this.uiContainer = undefined;
    this.locationName = locationName;
    this.boundingBoxes = boundingBoxes || new Map<ItemId, BBoxProperty>();
    this.bboxIds = bboxIds || [];
  }

  public fetchLatestState(): void {
    const latestBBoxIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.boundingBoxes,
      this.locationName
    );
    if (!latestBBoxIds) {
      return;
    }
    this.bboxIds = latestBBoxIds;
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Register boundingBoxes
    this.bboxIds.forEach(bboxId => {
      const bbox = this.boundingBoxes.get(bboxId);
      if (bbox) {
        const newBBox = new Phaser.GameObjects.Rectangle(
          gameManager,
          bbox.x,
          bbox.y,
          bbox.width,
          bbox.height,
          0,
          0
        ).setInteractive();
        newBBox.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
          const hasTriggered = GameActionManager.getInstance().hasTriggeredInteraction(
            bbox.interactionId
          );
          if (hasTriggered) {
            gameManager.input.setDefaultCursor(magnifyingGlassChecked);
          } else {
            gameManager.input.setDefaultCursor(magnifyingGlassHighlight);
          }
        });
        newBBox.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
          gameManager.input.setDefaultCursor(magnifyingGlass);
        });
        newBBox.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
          // Trigger action here
          GameActionManager.getInstance().triggerInteraction(bbox.interactionId);
        });
        exploreMenuContainer.add(newBBox);
      }
    });

    exploreMenuContainer.add(getBackToMenuContainer());

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    // Fetch latest state if location is not yet visited
    const hasUpdates = GameActionManager.getInstance().hasLocationUpdate(this.locationName);
    if (hasUpdates || !this.uiContainer) {
      if (this.uiContainer) {
        this.uiContainer.destroy();
      }
      this.fetchLatestState();
      this.uiContainer = await this.getUIContainer();
      gameManager.add.existing(this.uiContainer);
    }

    if (this.uiContainer) {
      this.uiContainer.setActive(true);
      this.uiContainer.setVisible(true);
      this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...entryTweenProps
      });
    }

    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('DeactivateUI: Game Manager is not defined!');
    }

    gameManager.input.setDefaultCursor('');

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
    }
  }
}

export default GameModeExplore;
