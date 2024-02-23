import FontAssets from 'src/features/game/assets/FontAssets';
import ImageAssets from 'src/features/game/assets/ImageAssets';
import SoundAssets from 'src/features/game/assets/SoundAssets';
import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import Parser from 'src/features/game/parser/Parser';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import { createButton } from 'src/features/game/utils/ButtonUtils';
import { mandatory, toS3Path } from 'src/features/game/utils/GameUtils';
import { calcTableFormatPos } from 'src/features/game/utils/StyleUtils';

import SSImageAssets from '../../assets/ImageAssets';
import { StorySimState } from '../../StorySimulatorTypes';
import mainMenuConstants, { mainMenuOptStyle } from './MainMenuConstants';

/**
 * Entry point for story simulator.
 *
 * User can access different story simulator
 * functionalities from here.
 */
class MainMenu extends Phaser.Scene {
  private layerManager?: GameLayerManager;

  constructor() {
    super('StorySimulatorMenu');
  }

  public preload() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.layerManager = new GameLayerManager(this);

    addLoadingScreen(this);
    Object.values(ImageAssets).forEach(asset =>
      this.load.image(asset.key, toS3Path(asset.path, false))
    );
    Object.values(SSImageAssets).forEach(asset =>
      this.load.image(asset.key, toS3Path(asset.path, false))
    );
    Object.values(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset.key, asset.pngPath, asset.fntPath)
    );
    SourceAcademyGame.getInstance().getSoundManager().loadSoundAssetMap(SoundAssets);
  }

  public async create() {
    if (SourceAcademyGame.getInstance().getAccountInfo().role === 'student') {
      console.log('Students cannot use story sim');
      return;
    }
    this.renderBackground();
    this.renderOptionButtons();
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = this.getOptionButtons();

    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length,
      maxXSpace: mainMenuConstants.optButton.xSpace,
      maxYSpace: mainMenuConstants.optButton.ySpace,
      numItemLimit: mainMenuConstants.maxOptButtonsRow,
      redistributeLast: true
    });

    optionsContainer.add(
      buttons.map((button, index) =>
        this.createOptButton(
          button.text,
          buttonPositions[index][0],
          buttonPositions[index][1],
          button.callback
        )
      )
    );
    this.getLayerManager().addToLayer(Layer.UI, optionsContainer);
  }

  private getOptionButtons() {
    return [
      {
        text: 'Object Placement',
        callback: () => {
          SourceAcademyGame.getInstance().setStorySimState(StorySimState.ObjectPlacement);
          this.getLayerManager().clearAllLayers();
          this.scene.start('ObjectPlacement');
        }
      },
      {
        text: 'Checkpoint Simulator',
        callback: () => {
          SourceAcademyGame.getInstance().setStorySimState(StorySimState.CheckpointSim);
        }
      },
      {
        text: 'Asset Uploader',
        callback: () => {
          SourceAcademyGame.getInstance().setStorySimState(StorySimState.AssetUploader);
        }
      },
      {
        text: 'Chapter Simulator',
        callback: () => {
          SourceAcademyGame.getInstance().setStorySimState(StorySimState.ChapterSim);
        }
      }
    ];
  }

  private createOptButton(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(this, {
      assetKey: SSImageAssets.invertedButton.key,
      message: text,
      textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
      bitMapTextStyle: mainMenuOptStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  public simulateCheckpoint() {
    const defaultChapterText =
      sessionStorage.getItem(mainMenuConstants.gameTxtStorageName.defaultChapter) || '';
    const checkpointTxt =
      sessionStorage.getItem(mainMenuConstants.gameTxtStorageName.checkpointTxt) || '';
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
      gameCheckpoint,
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
    this.getLayerManager().addToLayer(Layer.Background, backgroundImg);
    this.getLayerManager().addToLayer(Layer.Background, backgroundUnderlay);
  }
  public getLayerManager = () => mandatory(this.layerManager);
}

export default MainMenu;
