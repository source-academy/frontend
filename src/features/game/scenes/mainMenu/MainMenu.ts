import { mainMenuAssets, mainMenuOptBanner } from './MainMenuAssets';
import { studentRoomImg } from '../../location/GameMapConstants';
import { screenCenter, screenSize, Constants } from '../../commons/CommonConstants';
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
import commonSoundAssets, {
  buttonHoverSound,
  galacticHarmonyBgMusic
} from '../../commons/CommonSoundAssets';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { loadData } from '../../save/GameSaveRequests';
import game from 'src/pages/academy/game/subcomponents/phaserGame';
import { FullSaveState } from '../../save/GameSaveTypes';
import { SampleChapters } from '../chapterSelect/SampleChapters';

class MainMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private soundManager: GameSoundManager;
  private optionButtons: GameButton[];
  private loadedGameState: FullSaveState | undefined;

  constructor() {
    super('MainMenu');

    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.optionButtons = [];
  }

  public async preload() {
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.initialise(this);
    this.soundManager.loadSounds(commonSoundAssets.concat([galacticHarmonyBgMusic]));
    this.createOptionButtons();
  }

  public async create() {
    this.loadedGameState = await loadData(this.getAccountInfo()!);
    this.renderBackground();
    this.renderOptionButtons();

    this.soundManager.playBgMusic(galacticHarmonyBgMusic.key);
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
        .setOrigin(1.0, 0.15)
        .setAlign('right');
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
    this.addOptionButton(optionsText.play, () => this.newGame(), Constants.nullInteractionId);
    this.addOptionButton(
      optionsText.continue,
      () => this.continueGame(),
      Constants.nullInteractionId
    );
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
      Constants.nullFunction,
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

  private newGame() {
    const chapterNum = this.getUnplayedChapter();
    const fileName = SampleChapters[chapterNum].fileName;
    this.loadFile(fileName, true, chapterNum);
  }

  private getUnplayedChapter() {
    return Math.max(
      Object.keys(this.getLoadedGameState().gameSaveStates).length - 1,
      SampleChapters.length - 1
    );
  }

  private continueGame() {
    const chapterNum = this.getLastPlayedChapter();
    const fileName = SampleChapters[chapterNum].fileName;
    this.loadFile(fileName, true, chapterNum);
  }

  private getLastPlayedChapter() {
    return this.getLoadedGameState().userState.lastPlayedChapter;
  }

  private getLoadedGameState() {
    if (!this.loadedGameState) {
      throw new Error('Cannot load game');
    }
    return this.loadedGameState;
  }

  public loadFile(fileName: string, continueGame: boolean, chapterNum: number) {
    const key = `#${fileName}`;

    if (this.cache.text.exists(key)) {
      this.callGameManager(key, continueGame, chapterNum);
      return;
    }

    this.load.text(key, fileName);
    this.load.once('filecomplete', (key: string) => {
      this.callGameManager(key, continueGame, chapterNum);
    });
    this.load.start();
  }

  private callGameManager(key: string, continueGame: boolean, chapterNum: number) {
    if (key[0] === '#') {
      const text = this.cache.text.get(key);
      this.scene.start('GameManager', {
        text,
        continueGame: continueGame,
        chapterNum: chapterNum
      });
    }
  }

  private getAccountInfo() {
    if (!game.getAccountInfo()) {
      throw new Error('No account info');
    }
    return game.getAccountInfo();
  }
}

export default MainMenu;
