import { mainMenuAssets, mainMenuOptBanner, mainMenuBackground } from './MainMenuAssets';
import { screenCenter, screenSize, Constants } from '../../commons/CommonConstants';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { GameButton } from '../../commons/CommonTypes';
import {
  optionsText,
  mainMenuYSpace,
  mainMenuStyle,
  textXOffset,
  bannerHide,
  onFocusOptTween,
  outFocusOptTween
} from './MainMenuConstants';
import commonSoundAssets, {
  buttonHoverSound,
  galacticHarmonyBgMusic
} from '../../commons/CommonSoundAssets';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { loadData } from '../../save/GameSaveRequests';
import { toS3Path } from '../../utils/GameUtils';
import commonAssets from '../../commons/CommonAssets';
import { chapterSelectAssets } from '../chapterSelect/ChapterSelectAssets';
import { settingsAssets } from '../settings/SettingsAssets';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import commonFontAssets from '../../commons/CommonFontAssets';
import { getRoomPreviewCode } from '../roomPreview/RoomPreviewHelper';
import { createBitmapText } from '../../utils/TextUtils';

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
    this.soundManager.loadSounds(commonSoundAssets.concat([galacticHarmonyBgMusic]));
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
    this.soundManager.playBgMusic(galacticHarmonyBgMusic.key, volume);
  }

  private preloadAssets() {
    commonAssets.forEach(asset => this.load.image(asset.key, toS3Path(asset.path)));
    mainMenuAssets.forEach(asset => this.load.image(asset.key, toS3Path(asset.path)));
    chapterSelectAssets.forEach(asset => this.load.image(asset.key, toS3Path(asset.path)));
    settingsAssets.forEach(asset => this.load.image(asset.key, toS3Path(asset.path)));
    commonFontAssets.forEach(asset =>
      this.load.bitmapFont(asset.key, asset.pngPath, asset.fntPath)
    );
  }

  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      mainMenuBackground.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);

    this.layerManager.addToLayer(Layer.Background, backgroundImg);
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);

    this.optionButtons.forEach(button => {
      const text = button.text || '';
      const style = button.bitmapStyle || Constants.defaultFontStyle;
      const buttonText = createBitmapText(
        this,
        text,
        button.assetXPos,
        button.assetYPos,
        style
      ).setOrigin(1.0, 0.1);
      const buttonSprite = new Phaser.GameObjects.Sprite(
        this,
        screenCenter.x + bannerHide,
        button.assetYPos,
        button.assetKey
      ).setInteractive({ pixelPerfect: true, useHandCursor: true });

      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, button.onInteract);
      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        this.soundManager.playSound(buttonHoverSound.key);
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
    this.optionButtons = [];
    this.addOptionButton(
      optionsText.chapterSelect,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('ChapterSelect');
      },
      Constants.nullInteractionId
    );
    this.addOptionButton(
      optionsText.studentRoom,
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
      optionsText.settings,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('Settings');
      },
      Constants.nullInteractionId
    );
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
      bitmapStyle: mainMenuStyle,
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
