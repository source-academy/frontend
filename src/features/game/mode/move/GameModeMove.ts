import { IGameUI, GameSprite, screenSize } from '../../commons/CommonsTypes';
import { GameButton } from 'src/features/game/commons/CommonsTypes';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
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
} from './GameModeMoveTypes';
import { sleep } from 'src/features/game/util/GameUtils';

class GameModeMove implements IGameUI {
  public currentLocationAssetKey: string;
  public locationAssetKeys: Map<string, string>;
  public possibleLocations: Array<GameButton>;
  public previewFill: GameSprite;
  public previewFrame: GameSprite;

  constructor() {
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
    this.possibleLocations = new Array<GameButton>();
    this.locationAssetKeys = new Map<string, string>();
    this.previewFill = previewFill;
    this.previewFrame = previewFrame;
  }

  public getUIContainer(gameManager: GameManager): Phaser.GameObjects.Container {
    const moveMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

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

    this.possibleLocations.forEach(locationButton => {
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

  public async activateUI(
    gameManager: GameManager,
    container: Phaser.GameObjects.Container
  ): Promise<void> {
    container.setActive(true);
    container.setVisible(true);
    container.setPosition(container.x, -screenSize.y);

    gameManager.tweens.add({
      targets: container,
      ...moveEntryTweenProps
    });
  }

  public async deactivateUI(
    gameManager: GameManager,
    container: Phaser.GameObjects.Container
  ): Promise<void> {
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
