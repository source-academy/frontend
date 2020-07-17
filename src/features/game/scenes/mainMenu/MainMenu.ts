import SourceAcademyGame from 'src/pages/academy/game/subcomponents/SourceAcademyGame';

import FontAssets from '../../assets/FontAssets';
import ImageAssets from '../../assets/ImageAssets';
import SoundAssets from '../../assets/SoundAssets';
import TextAssets from '../../assets/TextAssets';
import { Constants, screenCenter, screenSize } from '../../commons/CommonConstants';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import AwardParser from '../../parser/AwardParser';
import { FullSaveState } from '../../save/GameSaveTypes';
import { createButton } from '../../utils/ButtonUtils';
import { mandatory, toS3Path } from '../../utils/GameUtils';
import { loadImage } from '../../utils/LoaderUtils';
import { calcTableFormatPos, Direction } from '../../utils/StyleUtils';
import { getRoomPreviewCode } from '../roomPreview/RoomPreviewHelper';
import mainMenuConstants, { mainMenuStyle } from './MainMenuConstants';

/**
 * User entry point into the game.
 *
 * User can navigate to other scenes from here.
 */
class MainMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private roomCode: string;

  private loadedGameState?: FullSaveState;

  constructor() {
    super('MainMenu');

    this.layerManager = new GameLayerManager();
    this.roomCode = Constants.nullInteractionId;
  }

  public preload() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.preloadAssets();
    this.layerManager.initialise(this);
    SourceAcademyGame.getInstance().getSoundManager().loadSoundAssetMap(SoundAssets);
    this.load.text(TextAssets.awardsMapping.key, TextAssets.awardsMapping.path);
    addLoadingScreen(this);
  }

  public async create() {
    if (SourceAcademyGame.getInstance().getAccountInfo().role === 'staff') {
      console.log('Staff do not have accounts');
      return;
    }
    this.renderBackground();
    this.renderOptionButtons();

    this.roomCode = await getRoomPreviewCode();
    await this.loadGameDataAndSettings();
    await this.preloadAwards();
  }

  private async loadGameDataAndSettings() {
    await SourceAcademyGame.getInstance().getSaveManager().loadLastSaveState();
    const volume = SourceAcademyGame.getInstance().getSaveManager().getSettings().volume;

    SourceAcademyGame.getInstance()
      .getSoundManager()
      .playBgMusic(SoundAssets.galacticHarmony.key, volume);
  }

  private async preloadAwards() {
    const awardsMappingTxt = this.cache.text.get(TextAssets.awardsMapping.key);
    const awardsMapping = AwardParser.parse(awardsMappingTxt);
    SourceAcademyGame.getInstance().setAwardsMapping(awardsMapping);

    await Promise.all(
      Array.from(awardsMapping.values()).map(
        async awardInfo => await loadImage(this, awardInfo.assetKey, awardInfo.assetPath)
      )
    );
  }

  private preloadAssets() {
    Object.values(ImageAssets).forEach(asset => this.load.image(asset.key, toS3Path(asset.path)));
    Object.values(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset.key, asset.pngPath, asset.fntPath)
    );
  }

  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.mainMenuBackground.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);

    this.layerManager.addToLayer(Layer.Background, backgroundImg);
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = this.getOptionButtons();

    const buttonPositions = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: buttons.length,
      maxYSpace: mainMenuConstants.buttonYSpace
    });

    optionsContainer.add(
      buttons.map((button, index) =>
        this.createOptionButton(
          button.text,
          buttonPositions[index][0] + mainMenuConstants.bannerHide,
          buttonPositions[index][1],
          button.callback
        )
      )
    );

    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  private createOptionButton(text: string, xPos: number, yPos: number, callback: any) {
    const tweenOnHover = (target: Phaser.GameObjects.Container) => {
      this.tweens.add({
        targets: target,
        ...mainMenuConstants.onFocusOptTween
      });
    };
    const tweenOffHover = (target: Phaser.GameObjects.Container) => {
      this.tweens.add({
        targets: target,
        ...mainMenuConstants.outFocusOptTween
      });
    };
    const optButton: Phaser.GameObjects.Container = createButton(this, {
      assetKey: ImageAssets.mainMenuOptBanner.key,
      message: text,
      textConfig: { x: mainMenuConstants.textXOffset, y: 0, oriX: 1.0, oriY: 0.1 },
      bitMapTextStyle: mainMenuStyle,
      onUp: callback,
      onHover: () => tweenOnHover(optButton),
      onOut: () => tweenOffHover(optButton),
      onHoverEffect: false
    }).setPosition(xPos, yPos);
    return optButton;
  }

  private getOptionButtons() {
    return [
      {
        text: mainMenuConstants.optionsText.chapterSelect,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('ChapterSelect');
        }
      },
      {
        text: mainMenuConstants.optionsText.awards,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('AwardsHall');
        }
      },
      {
        text: mainMenuConstants.optionsText.studentRoom,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('RoomPreview', {
            studentCode: this.roomCode
          });
        }
      },
      {
        text: mainMenuConstants.optionsText.settings,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('Settings');
        }
      }
    ];
  }

  public getLoadedGameState = () => mandatory(this.loadedGameState);
}

export default MainMenu;
