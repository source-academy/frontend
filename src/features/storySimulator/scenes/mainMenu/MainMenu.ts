import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import storySimulatorAssets, {
  studentRoomImg,
  invertedButton,
  blueUnderlay
} from 'src/features/storySimulator/utils/StorySimulatorAssets';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import { ImageAsset } from 'src/features/game/commons/CommonsTypes';
import Parser from 'src/features/game/parser/Parser';
import {
  maxOptButtonsRow,
  optButtonsXSpace,
  optButtonsYSpace,
  mainMenuOptStyle,
  gameTxtStorageName
} from './MainMenuConstants';
import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';
import { mandatory } from 'src/features/game/utils/GameUtils';

class MainMenu extends Phaser.Scene {
  private layerManager?: GameLayerManager;

  constructor() {
    super('StorySimulatorMenu');
  }

  public async preload() {
    storySimulatorAssets.forEach((asset: ImageAsset) => this.load.image(asset.key, asset.path));
  }

  public async create() {
    this.layerManager = new GameLayerManager(this);
    this.renderBackground();
    this.renderOptionButtons();
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = [
      {
        text: 'Object Placement',
        callback: () => {
          getStorySimulatorGame().getStorySimProps('setStorySimState')('objectPlacement');
          this.getLayerManager().clearAllLayers();
          this.scene.start('ObjectPlacement');
        }
      },
      {
        text: 'Simulate Checkpoint',
        callback: () => {
          getStorySimulatorGame().getStorySimProps('setStorySimState')('upload');
          this.callGameManager();
        }
      },
      {
        text: 'Asset Uploader',
        callback: () => {
          getStorySimulatorGame().getStorySimProps('setStorySimState')('assetUploader');
        }
      }
    ];
    optionsContainer.add(
      buttons.map((button, index) =>
        this.createOptionButton(button.text, index, buttons.length, button.callback)
      )
    );
    this.getLayerManager().addToLayer(Layer.UI, optionsContainer);
  }

  private createOptionButton(
    text: string,
    buttonIndex: number,
    numOfButtons: number,
    callback: any
  ): Phaser.GameObjects.Container {
    const buttonContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const numOfRows = Math.ceil(numOfButtons / maxOptButtonsRow);
    const numOfButtonsAtLastRow = numOfButtons % maxOptButtonsRow;
    const buttonYIdx = Math.floor(buttonIndex / maxOptButtonsRow);
    const buttonXIdx = buttonIndex % maxOptButtonsRow;

    const partitionYSpace = optButtonsYSpace / numOfRows;
    const buttonYPos =
      (screenSize.y - optButtonsYSpace + partitionYSpace) / 2 + buttonYIdx * partitionYSpace;

    const partitionXSpace =
      buttonYIdx === numOfRows - 1
        ? optButtonsXSpace / numOfButtonsAtLastRow
        : optButtonsXSpace / maxOptButtonsRow;
    const buttonXPos =
      (screenSize.x - optButtonsXSpace + partitionXSpace) / 2 + buttonXIdx * partitionXSpace;

    const buttonSprite = new Phaser.GameObjects.Image(
      this,
      buttonXPos,
      buttonYPos,
      invertedButton.key
    );
    buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

    const buttonText = new Phaser.GameObjects.Text(
      this,
      buttonXPos,
      buttonYPos,
      text,
      mainMenuOptStyle
    ).setOrigin(0.5, 0.5);

    buttonContainer.add([buttonSprite, buttonText]);
    return buttonContainer;
  }

  private callGameManager() {
    const defaultChapterText = sessionStorage.getItem(gameTxtStorageName.defaultChapter) || '';
    const checkpointTxt = sessionStorage.getItem(gameTxtStorageName.checkpointTxt) || '';
    if (defaultChapterText === '' && checkpointTxt === '') {
      return;
    }
    this.getLayerManager().clearAllLayers();
    Parser.parse(defaultChapterText);
    if (checkpointTxt) {
      Parser.parse(checkpointTxt, true);
    }
    const gameCheckpoint = Parser.checkpoint;

    this.scene.start('GameManager', {
      isStorySimulator: true,
      fullSaveState: undefined,
      gameCheckpoint,
      continueGame: false,
      chapterNum: -1,
      checkpointNum: -1
    });
  }

  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      studentRoomImg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);
    const backgroundUnderlay = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      blueUnderlay.key
    ).setAlpha(0.5);
    this.getLayerManager().addToLayer(Layer.Background, backgroundImg);
    this.getLayerManager().addToLayer(Layer.Background, backgroundUnderlay);
  }
  public getLayerManager = () => mandatory(this.layerManager) as GameLayerManager;
}

export default MainMenu;
