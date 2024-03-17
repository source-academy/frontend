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

import {
  gameSimulatorMenuAssets,
  gameSimulatorMenuConstants,
  gameSimulatorMenuOptStyle
} from './GameSimulatorConstants';
import { GameSimulatorState } from './GameSimulatorTypes';

/**
 * Entry point for Game simulator.
 *
 * User can access different Game simulator
 * functionalities from here.
 */
class GameSimulatorMenu extends Phaser.Scene {
  private layerManager?: GameLayerManager;

  constructor() {
    super('GameSimulatorMenu');
  }

  public preload() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.layerManager = new GameLayerManager(this);

    addLoadingScreen(this);
    Object.values(ImageAssets).forEach(asset =>
      this.load.image(asset.key, toS3Path(asset.path, false))
    );
    Object.values(gameSimulatorMenuAssets).forEach(asset =>
      this.load.image(asset.key, toS3Path(asset.path, false))
    );
    Object.values(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset.key, asset.pngPath, asset.fntPath)
    );
    SourceAcademyGame.getInstance().getSoundManager().loadSoundAssetMap(SoundAssets);
  }

  public async create() {
    if (SourceAcademyGame.getInstance().getAccountInfo().role === 'student') {
      console.log('Students cannot use Game sim');
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
      maxXSpace: gameSimulatorMenuConstants.optButton.xSpace,
      maxYSpace: gameSimulatorMenuConstants.optButton.ySpace,
      numItemLimit: gameSimulatorMenuConstants.maxOptButtonsRow,
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
        text: 'Simulate Chapters',
        callback: () => {
          SourceAcademyGame.getInstance().setGameSimState(GameSimulatorState.CHAPTERSIMULATOR);
        }
      },
      {
        text: 'Publish / Edit Chapters',
        callback: () => {
          SourceAcademyGame.getInstance().setGameSimState(GameSimulatorState.CHAPTERPUBLISHER);
        }
      },
      {
        text: 'View / Upload Assets',
        callback: () => {
          SourceAcademyGame.getInstance().setGameSimState(GameSimulatorState.ASSETVIEWER);
        }
      }
    ];
  }

  private createOptButton(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(this, {
      assetKey: gameSimulatorMenuAssets.invertedButton.key,
      message: text,
      textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
      bitMapTextStyle: gameSimulatorMenuOptStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  public simulateCheckpoint() {
    const defaultChapterText =
      sessionStorage.getItem(gameSimulatorMenuConstants.gameTxtStorageName.defaultChapter) || '';
    const checkpointTxt =
      sessionStorage.getItem(gameSimulatorMenuConstants.gameTxtStorageName.checkpointTxt) || '';
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
      gameSimulatorMenuAssets.gameSimBg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);
    const backgroundUnderlay = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      gameSimulatorMenuAssets.blueUnderlay.key
    ).setAlpha(0.5);
    this.getLayerManager().addToLayer(Layer.Background, backgroundImg);
    this.getLayerManager().addToLayer(Layer.Background, backgroundUnderlay);
  }
  public getLayerManager = () => mandatory(this.layerManager);
}

export default GameSimulatorMenu;
