import {
  IGameUI,
  GameSprite,
  screenSize,
  GameButton,
  longButton
} from '../../commons/CommonsTypes';
import {
  defaultLocationImg,
  locationPreviewFrame,
  locationPreviewFill,
  moveEntryTweenProps,
  moveExitTweenProps,
  previewFrameXPos,
  previewXPos,
  previewYPos,
  previewHeight,
  previewWidth
} from './GameModeMoveConstants';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { sleep } from '../../utils/GameUtils';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocation, GameLocationAttr } from '../../location/GameMapTypes';
import { moveButtonYSpace, moveButtonStyle, moveButtonXPos } from './GameModeMoveConstants';

class GameModeMove implements IGameUI {
  private currentLocationAssetKey: string;
  private locationAssetKeys: Map<string, string>;
  private previewFill: GameSprite;
  private previewFrame: GameSprite;
  private locationName: string;
  private locations: Map<string, GameLocation>;
  private gameButtons: GameButton[];

  constructor(locationName: string, navigation: string[], locations: Map<string, GameLocation>) {
    const previewFill = {
      assetKey: locationPreviewFill.key,
      assetXPos: locationPreviewFill.xPos,
      assetYPos: locationPreviewFill.yPos
    } as GameSprite;

    const previewFrame = {
      assetKey: locationPreviewFrame.key,
      assetXPos: locationPreviewFrame.xPos,
      assetYPos: locationPreviewFrame.yPos
    } as GameSprite;

    this.currentLocationAssetKey = defaultLocationImg.key;
    this.locationAssetKeys = new Map<string, string>();
    this.previewFill = previewFill;
    this.previewFrame = previewFrame;
    this.locationName = locationName;
    this.locations = locations;
    this.gameButtons = [];
    this.createGameButtons(navigation);
  }

  private async createGameButtons(navigation: string[]) {
    // Refresh Buttons
    this.gameButtons = [];

    await navigation.forEach(locationName => {
      const location = this.locations.get(locationName);
      if (location) {
        this.addMoveOptionButton(location.name, () => {
          GameActionManager.getInstance().changeLocationTo(locationName);
        });
        this.locationAssetKeys.set(locationName, location.assetKey);
      }
    });
  }

  private addMoveOptionButton(name: string, callback: any) {
    const newNumberOfButtons = this.gameButtons.length + 1;
    const partitionSize = moveButtonYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - moveButtonYSpace) / 2 + partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.gameButtons.length; i++) {
      this.gameButtons[i] = {
        ...this.gameButtons[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: name,
      style: moveButtonStyle,
      assetKey: longButton.key,
      assetXPos: moveButtonXPos,
      assetYPos: newYPos + this.gameButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const moveMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Fetch latest state if location is not yet visited
    const hasUpdates = GameActionManager.getInstance().hasLocationUpdate(this.locationName);

    if (hasUpdates) {
      const latestLocationNav = GameActionManager.getInstance().getLocationAttr(
        GameLocationAttr.navigation,
        this.locationName
      );
      if (!latestLocationNav) {
        return moveMenuContainer;
      }
      this.createGameButtons(latestLocationNav);
    }

    const previewFrame = new Phaser.GameObjects.Image(
      gameManager,
      previewFrameXPos,
      this.previewFrame.assetYPos,
      this.previewFrame.assetKey
    );
    moveMenuContainer.add(previewFrame);

    const previewFill = new Phaser.GameObjects.Sprite(
      gameManager,
      this.previewFill.assetXPos,
      this.previewFill.assetYPos,
      this.previewFill.assetKey
    );

    this.setPreview(previewFill, this.currentLocationAssetKey);
    moveMenuContainer.add(previewFill);

    this.gameButtons.forEach(locationButton => {
      const text = locationButton.text ? locationButton.text : '';
      const style = locationButton.style ? locationButton.style : {};
      const locationButtonText = new Phaser.GameObjects.Text(
        gameManager,
        locationButton.assetXPos,
        locationButton.assetYPos,
        text,
        style
      ).setOrigin(0.5, 0.25);

      const buttonSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        locationButton.assetXPos,
        locationButton.assetYPos,
        locationButton.assetKey
      );

      if (locationButton.isInteractive) {
        buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
        buttonSprite.addListener(
          Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
          locationButton.onInteract
        );
        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
          // Preview location
          const assetKey = this.locationAssetKeys.get(text);
          if (!assetKey || this.currentLocationAssetKey === assetKey) {
            return;
          }
          this.setPreview(previewFill, assetKey);
        });
        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
          // Reset preview
          this.setPreview(previewFill, defaultLocationImg.key);
        });
      }

      moveMenuContainer.add(buttonSprite);
      moveMenuContainer.add(locationButtonText);
    });

    // Add back button
    moveMenuContainer.add(getBackToMenuContainer());
    return moveMenuContainer;
  }

  private setPreview(sprite: Phaser.GameObjects.Sprite, assetKey: string) {
    sprite
      .setTexture(assetKey)
      .setDisplaySize(previewWidth, previewHeight)
      .setPosition(previewXPos, previewYPos);

    // Update
    this.currentLocationAssetKey = assetKey;
  }

  public async activateUI(container: Phaser.GameObjects.Container): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    container.setActive(true);
    container.setVisible(true);
    container.setPosition(container.x, -screenSize.y);

    gameManager.tweens.add({
      targets: container,
      ...moveEntryTweenProps
    });

    await sleep(800);
  }

  public async deactivateUI(container: Phaser.GameObjects.Container): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('DeactivateUI: Game Manager is not defined!');
    }
    container.setPosition(container.x, 0);

    gameManager.tweens.add({
      targets: container,
      ...moveExitTweenProps
    });

    await sleep(500);
    container.setVisible(false);
    container.setActive(false);
  }
}

export default GameModeMove;
