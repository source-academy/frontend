import { screenCenter, screenSize, Constants } from '../../commons/CommonConstants';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { GameButton } from '../../commons/CommonTypes';
import mainMenuConstants, { mainMenuStyle } from './MainMenuConstants';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { loadData } from '../../save/GameSaveRequests';
import { toS3Path } from '../../utils/GameUtils';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import { getRoomPreviewCode } from '../roomPreview/RoomPreviewHelper';
import ImageAssets from '../../assets/ImageAssets';
import FontAssets from '../../assets/FontAssets';
import SoundAssets from '../../assets/SoundAssets';
import { createButton } from '../../utils/ButtonUtils';

class MainMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private soundManager: GameSoundManager;
  private optionButtons: GameButton[];
  private roomCode: string;

  constructor() {
    super('MainMenu');

    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.optionButtons = [];
    this.roomCode = Constants.nullInteractionId;
  }

  public preload() {
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.initialise(this, getSourceAcademyGame());
    this.soundManager.loadSoundAssetMap(SoundAssets);
    this.createOptionButtons();
    addLoadingScreen(this);
  }

  public async create() {
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    if (accountInfo.role === 'staff') {
      console.log('Staff do not have accounts');
      return;
    }
    this.renderBackground();
    this.renderOptionButtons();

    this.roomCode = await getRoomPreviewCode(accountInfo);
    const fullSaveState = await loadData(accountInfo);
    const volume = fullSaveState.userState ? fullSaveState.userState.settings.volume : 1;
    this.soundManager.playBgMusic(SoundAssets.galacticHarmony.key, volume);
  }

  private preloadAssets() {
    Object.entries(ImageAssets).forEach(asset =>
      this.load.image(asset[1].key, toS3Path(asset[1].path))
    );
    Object.entries(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset[1].key, asset[1].pngPath, asset[1].fntPath)
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

    this.optionButtons.forEach(button => {
      const text = button.text || '';
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
      const optButton: Phaser.GameObjects.Container = createButton(
        this,
        text,
        button.assetKey,
        { x: mainMenuConstants.textXOffset, y: 0, oriX: 1.0, oriY: 0.1 },
        this.soundManager,
        button.onInteract,
        undefined,
        button.bitmapStyle,
        () => tweenOnHover(optButton),
        false,
        undefined,
        () => tweenOffHover(optButton)
      ).setPosition(screenCenter.x + mainMenuConstants.bannerHide, button.assetYPos);
      optionsContainer.add(optButton);
    });

    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  private createOptionButtons() {
    this.optionButtons = [];
    this.addOptionButton(
      mainMenuConstants.optionsText.chapterSelect,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('ChapterSelect');
      },
      Constants.nullInteractionId
    );
    this.addOptionButton(
      mainMenuConstants.optionsText.studentRoom,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('MyRoom');
      },
      Constants.nullInteractionId
    );
    this.addOptionButton(
      'Room Preview',
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('RoomPreview', { studentCode: this.roomCode });
      },
      Constants.nullInteractionId
    );
    this.addOptionButton(
      mainMenuConstants.optionsText.settings,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('Settings');
      },
      Constants.nullInteractionId
    );
  }

  private addOptionButton(name: string, callback: any, interactionId: string) {
    const newNumberOfButtons = this.optionButtons.length + 1;
    const partitionSize = mainMenuConstants.buttonYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - mainMenuConstants.buttonYSpace + partitionSize) / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.optionButtons.length; i++) {
      this.optionButtons[i] = {
        ...this.optionButtons[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newOptButton: GameButton = {
      text: name,
      bitmapStyle: mainMenuStyle,
      assetKey: ImageAssets.mainMenuOptBanner.key,
      assetXPos: screenSize.x - mainMenuConstants.optXOffset,
      assetYPos: newYPos + this.optionButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      interactionId: interactionId
    };

    // Update
    this.optionButtons.push(newOptButton);
  }
}

export default MainMenu;
