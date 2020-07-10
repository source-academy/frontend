import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import Parser from 'src/features/game/parser/Parser';
import mainMenuConstants, { mainMenuOptStyle } from './MainMenuConstants';
import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';
import { toS3Path } from 'src/features/game/utils/GameUtils';
import { StorySimState } from '../../StorySimulatorTypes';
import { createBitmapText } from 'src/features/game/utils/TextUtils';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import ImageAssets from 'src/features/game/assets/ImageAssets';
import SSImageAssets from '../../assets/ImageAssets';
import FontAssets from 'src/features/game/assets/FontAssets';

class MainMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;

  constructor() {
    super('StorySimulatorMenu');
    this.layerManager = new GameLayerManager();
  }
  public init() {
    getStorySimulatorGame().setStorySimProps({ mainMenuRef: this });
    this.layerManager.initialiseMainLayer(this);
  }

  public async preload() {
    addLoadingScreen(this);
    Object.entries(ImageAssets).forEach(asset =>
      this.load.image(asset[1].key, toS3Path(asset[1].path))
    );
    Object.entries(SSImageAssets).forEach(asset =>
      this.load.image(asset[1].key, toS3Path(asset[1].path))
    );
    Object.entries(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset[1].key, asset[1].pngPath, asset[1].fntPath)
    );
  }

  public async create() {
    this.renderBackground();
    this.renderOptionButtons();
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = [
      {
        text: 'Object Placement',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.ObjectPlacement);
          this.layerManager.clearAllLayers();
          this.scene.start('ObjectPlacement');
        }
      },
      {
        text: 'Simulate Checkpoint',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.CheckpointSim);
        }
      },
      {
        text: 'Asset Uploader',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.AssetUploader);
        }
      },
      {
        text: 'Chapter Sequencer',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.ChapterSequence);
        }
      }
    ];
    optionsContainer.add(
      buttons.map((button, index) =>
        this.createOptionButton(button.text, index, buttons.length, button.callback)
      )
    );
    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  private createOptionButton(
    text: string,
    buttonIndex: number,
    numOfButtons: number,
    callback: any
  ): Phaser.GameObjects.Container {
    const buttonContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const numOfRows = Math.ceil(numOfButtons / mainMenuConstants.maxOptButtonsRow);
    const numOfButtonsAtLastRow =
      numOfButtons % mainMenuConstants.maxOptButtonsRow || mainMenuConstants.maxOptButtonsRow;
    const buttonYIdx = Math.floor(buttonIndex / mainMenuConstants.maxOptButtonsRow);
    const buttonXIdx = buttonIndex % mainMenuConstants.maxOptButtonsRow;

    const partitionYSpace = mainMenuConstants.optButtonsYSpace / numOfRows;
    const buttonYPos =
      (screenSize.y - mainMenuConstants.optButtonsYSpace + partitionYSpace) / 2 +
      buttonYIdx * partitionYSpace;

    const partitionXSpace =
      buttonYIdx === numOfRows - 1
        ? mainMenuConstants.optButtonsXSpace / numOfButtonsAtLastRow
        : mainMenuConstants.optButtonsXSpace / mainMenuConstants.maxOptButtonsRow;

    const buttonXPos =
      (screenSize.x - mainMenuConstants.optButtonsXSpace + partitionXSpace) / 2 +
      buttonXIdx * partitionXSpace;

    const buttonSprite = new Phaser.GameObjects.Image(
      this,
      buttonXPos,
      buttonYPos,
      SSImageAssets.invertedButton.key
    );
    buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

    const buttonText = createBitmapText(
      this,
      text,
      buttonXPos,
      buttonYPos,
      mainMenuOptStyle
    ).setOrigin(0.5, 0.5);

    buttonContainer.add([buttonSprite, buttonText]);
    return buttonContainer;
  }

  public callGameManager() {
    const defaultChapterText =
      sessionStorage.getItem(mainMenuConstants.gameTxtStorageName.defaultChapter) || '';
    const checkpointTxt =
      sessionStorage.getItem(mainMenuConstants.gameTxtStorageName.checkpointTxt) || '';
    if (defaultChapterText === '' && checkpointTxt === '') {
      return;
    }
    this.layerManager.clearAllLayers();
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
      SSImageAssets.storySimBg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);
    const backgroundUnderlay = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      SSImageAssets.blueUnderlay.key
    ).setAlpha(0.5);
    this.layerManager.addToLayer(Layer.Background, backgroundImg);
    this.layerManager.addToLayer(Layer.Background, backgroundUnderlay);
  }
}

export default MainMenu;
