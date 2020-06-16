import { mainMenuAssets, mainMenuOptBanner } from './MainMenuAssets';
import { studentRoomImg } from '../../location/GameMapConstants';
import { screenCenter, screenSize, nullInteractionId } from '../../commons/CommonConstants';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { GameButton } from '../../commons/CommonsTypes';
import {
  optionsText,
  mainMenuYSpace,
  mainMenuStyle,
  textXOffset,
  bannerHide,
  onFocusOptTween,
  outFocusOptTween
} from './MainMenuConstants';
import { addLoadingScreen } from '../../utils/LoadingScreen';

class MainMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private optionButtons: GameButton[];

  constructor() {
    super('MainMenu');

    this.layerManager = new GameLayerManager();
    this.optionButtons = [];
  }

  public preload() {
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
    this.createOptionButtons();
    addLoadingScreen(this);
  }

  public create() {
    this.renderBackground();
    this.renderOptionButtons();
  }

  private preloadAssets() {
    mainMenuAssets.forEach(asset => this.load.image(asset.key, asset.path));
  }

  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      studentRoomImg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);

    this.layerManager.addToLayer(Layer.Background, backgroundImg);
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);

    this.optionButtons.forEach(button => {
      const text = button.text || '';
      const style = button.style || {};
      const buttonText = new Phaser.GameObjects.Text(
        this,
        button.assetXPos,
        button.assetYPos,
        text,
        style
      )
        .setOrigin(1.0, 0.2)
        .setAlign('right');
      const buttonSprite = new Phaser.GameObjects.Sprite(
        this,
        screenCenter.x + bannerHide,
        button.assetYPos,
        button.assetKey
      ).setInteractive({ pixelPerfect: true, useHandCursor: true });

      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, button.onInteract);
      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        this.tweens.add({
          targets: buttonSprite,
          ...onFocusOptTween
        });
      });
      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        this.tweens.add({
          targets: buttonSprite,
          ...outFocusOptTween
        });
      });
      optionsContainer.add(buttonSprite);
      optionsContainer.add(buttonText);
    });

    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  private createOptionButtons() {
    this.addOptionButton(optionsText.play, () => {}, nullInteractionId);
    this.addOptionButton(optionsText.continue, () => {}, nullInteractionId);
    this.addOptionButton(
      optionsText.chapterSelect,
      () => {
        this.scene.start('ChapterSelect');
      },
      nullInteractionId
    );
    this.addOptionButton(optionsText.studentRoom, () => {}, nullInteractionId);
  }

  private addOptionButton(name: string, callback: any, interactionId: string) {
    const newNumberOfButtons = this.optionButtons.length + 1;
    const partitionSize = mainMenuYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - mainMenuYSpace + partitionSize) / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.optionButtons.length; i++) {
      this.optionButtons[i] = {
        ...this.optionButtons[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newTalkButton: GameButton = {
      text: name,
      style: mainMenuStyle,
      assetKey: mainMenuOptBanner.key,
      assetXPos: screenSize.x - textXOffset,
      assetYPos: newYPos + this.optionButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      interactionId: interactionId
    };

    // Update
    this.optionButtons.push(newTalkButton);
  }
}

export default MainMenu;
