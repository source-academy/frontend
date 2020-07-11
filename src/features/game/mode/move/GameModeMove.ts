import { IGameUI, GameSprite, GameButton } from '../../commons/CommonTypes';
import modeMoveConstants, {
  moveButtonStyle,
  previewFill,
  previewFrame
} from './GameModeMoveConstants';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import { sleep } from '../../utils/GameUtils';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { screenSize } from '../../commons/CommonConstants';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { Layer } from '../../layer/GameLayerTypes';
import CommonBackButton from '../../commons/CommonBackButton';
import ImageAssets from '../../assets/ImageAssets';
import { createButton } from '../../utils/ButtonUtils';

class GameModeMove implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private currentLocationAssetKey: string;
  private locationAssetKeys: Map<string, string>;
  private previewFill: GameSprite;
  private previewFrame: GameSprite;
  private gameButtons: GameButton[];

  constructor() {
    this.uiContainer = undefined;
    this.currentLocationAssetKey = ImageAssets.defaultLocationImg.key;
    this.locationAssetKeys = new Map<string, string>();
    this.previewFill = previewFill;
    this.previewFrame = previewFrame;
    this.gameButtons = [];
  }

  private async createGameButtons(navigation: string[]) {
    // Refresh Buttons
    this.gameButtons = [];

    await navigation.forEach(locationId => {
      const location = GameGlobalAPI.getInstance().getLocationAtId(locationId);
      if (location) {
        this.addMoveOptionButton(location.name, async () => {
          await GameGlobalAPI.getInstance().popPhase();
          await GameGlobalAPI.getInstance().changeLocationTo(location.id);
        });
        this.locationAssetKeys.set(location.name, location.assetKey);
      }
    });
  }

  private addMoveOptionButton(name: string, callback: any) {
    const newNumberOfButtons = this.gameButtons.length + 1;
    const partitionSize = modeMoveConstants.buttonYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - modeMoveConstants.buttonYSpace) / 2 + partitionSize / 2;

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
      bitmapStyle: moveButtonStyle,
      assetKey: ImageAssets.longButton.key,
      assetXPos: modeMoveConstants.buttonXPos,
      assetYPos: newYPos + this.gameButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      interactionId: name
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  public fetchLatestState(): void {
    const locationId = GameGlobalAPI.getInstance().getCurrLocId();
    const latestLocationNav = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.navigation,
      locationId
    );
    if (!latestLocationNav) {
      return;
    }
    this.createGameButtons(latestLocationNav);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const moveMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const previewFrame = new Phaser.GameObjects.Image(
      gameManager,
      modeMoveConstants.previewFrameXPos,
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

      const previewLoc = () => {
        const assetKey = this.locationAssetKeys.get(text);
        if (!assetKey || this.currentLocationAssetKey === assetKey) {
          return;
        }
        this.setPreview(previewFill, assetKey);
      };

      const previewDefault = () => {
        this.setPreview(previewFill, ImageAssets.defaultLocationImg.key);
      };

      const button = createButton(
        gameManager,
        {
          assetKey: locationButton.assetKey,
          message: text,
          textConfig: { x: 0, y: 0, oriX: 0.4, oriY: 0.15 },
          bitMapTextStyle: locationButton.bitmapStyle,
          onUp: locationButton.onInteract,
          onHover: previewLoc,
          onOut: previewDefault
        },
        gameManager.soundManager
      ).setPosition(locationButton.assetXPos, locationButton.assetYPos);

      moveMenuContainer.add(button);
    });

    // Add back button
    const backButton = new CommonBackButton(
      gameManager,
      () => {
        GameGlobalAPI.getInstance().popPhase();
        GameGlobalAPI.getInstance().getGameManager().layerManager.fadeInLayer(Layer.Character, 300);
      },
      0,
      0,
      gameManager.soundManager
    );
    moveMenuContainer.add(backButton);
    return moveMenuContainer;
  }

  private setPreview(sprite: Phaser.GameObjects.Sprite, assetKey: string) {
    sprite
      .setTexture(assetKey)
      .setDisplaySize(modeMoveConstants.previewWidth, modeMoveConstants.previewHeight)
      .setPosition(modeMoveConstants.previewXPos, modeMoveConstants.previewYPos);

    // Update
    this.currentLocationAssetKey = assetKey;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    this.fetchLatestState();
    this.uiContainer = await this.getUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

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
}

export default GameModeMove;
