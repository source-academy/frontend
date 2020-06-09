import { IGameUI, GameSprite, screenSize } from '../../commons/CommonsTypes';
import { GameButton } from 'src/features/game/commons/CommonsTypes';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import {
  cropPos,
  defaultLocationImg,
  locationPreviewFrame,
  locationPreviewFill,
  moveEntryTweenProps,
  moveExitTweenProps,
  previewXPos,
  previewScale
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
      previewXPos,
      this.previewFrame.assetYPos,
      this.previewFrame.assetKey
    );
    moveMenuContainer.add(previewFrame);

    const previewFill = new Phaser.GameObjects.Sprite(
      gameManager,
      previewXPos,
      this.previewFill.assetYPos,
      this.previewFill.assetKey
    );
    previewFill
      .setTexture(this.currentLocationAssetKey)
      .setScale(previewScale)
      .setCrop(cropPos[0], cropPos[1], cropPos[2], cropPos[3]);
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
        buttonSprite.addListener(
          Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
          () => {
            // Preview Location
            const assetKey = this.locationAssetKeys.get(text);
            if (!assetKey || this.currentLocationAssetKey === assetKey) {
              return;
            }
            previewFill
              .setTexture(assetKey)
              .setScale(previewScale)
              .setCrop(cropPos[0], cropPos[1], cropPos[2], cropPos[3]);
            this.currentLocationAssetKey = assetKey;
          }
        );
      }

      moveMenuContainer.add(buttonSprite);
      moveMenuContainer.add(locationButtonText);
    });

    return moveMenuContainer;
  }

  public async activateUI(gameManager: GameManager, container: Phaser.GameObjects.Container): Promise<void> {
    container.setActive(true);
    container.setVisible(true);
    container.setPosition(container.x, -screenSize.y);

    gameManager.tweens.add({
      targets: container,
      ...moveEntryTweenProps
    });
  }

  public async deactivateUI(gameManager: GameManager, container: Phaser.GameObjects.Container): Promise<void> {
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
