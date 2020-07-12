import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { screenSize, screenCenter } from '../commons/CommonConstants';
import { createButton } from '../utils/ButtonUtils';
import escapeConstants, {
  escapeOptButtonStyle,
  volumeRadioOptTextStyle,
  optTextStyle
} from './GameEscapeConstants';
import { Layer } from '../layer/GameLayerTypes';
// import CommonRadioButtons from '../commons/CommonRadioButtons';
import settingsConstants from '../scenes/settings/SettingsConstants';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import { IGameUI } from '../commons/CommonTypes';
import { createBitmapText } from '../utils/TextUtils';
import ImageAssets from '../assets/ImageAssets';
import { calcTableFormatPos } from '../utils/StyleUtils';
import CommonRadioButton from '../commons/CommonRadioButton';

class GameEscapeManager implements IGameUI {
  private volumeOptions: CommonRadioButton | undefined;

  private createUIContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const escapeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const escapeMenuBg = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.escapeMenuBackground.key
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setInteractive({ pixelPerfect: true });

    const volOpt = this.createVolOptContainer();
    escapeMenuContainer.add([escapeMenuBg, volOpt]);

    const buttons = this.getOptButtons();
    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length
    });

    escapeMenuContainer.add(
      buttons.map((button, index) =>
        this.createEscapeOptButton(
          button.text,
          buttonPositions[index][0],
          buttonPositions[index][1] + escapeConstants.buttonYPos,
          button.callback
        )
      )
    );

    return escapeMenuContainer;
  }

  public getOptButtons() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return [
      {
        text: 'Main Menu',
        callback: () => {
          gameManager.cleanUp();
          if (gameManager.isStorySimulator) {
            gameManager.scene.start('StorySimulatorMenu');
          } else {
            gameManager.scene.start('MainMenu');
          }
        }
      },
      {
        text: 'Continue',
        callback: async () => {
          if (GameGlobalAPI.getInstance().isCurrentPhase(GamePhaseType.EscapeMenu)) {
            await GameGlobalAPI.getInstance().popPhase();
          }
        }
      },
      {
        text: 'Apply Settings',
        callback: () => this.applySettings()
      }
    ];
  }

  public activateUI() {
    const escapeMenuContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Escape, escapeMenuContainer);
  }

  public deactivateUI() {
    GameGlobalAPI.getInstance().getGameManager().layerManager.clearSeveralLayers([Layer.Escape]);
  }

  private createVolOptContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const volOptContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const userVol = GameGlobalAPI.getInstance().getLoadedUserState().settings.volume;
    const userVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === userVol
    );

    const volumeText = createBitmapText(
      gameManager,
      'Volume',
      escapeConstants.optTextXPos,
      escapeConstants.optTextYPos,
      optTextStyle
    );

    this.volumeOptions = new CommonRadioButton(
      gameManager,
      {
        choices: settingsConstants.volContainerOpts,
        defaultChoiceIdx: userVolIdx,
        maxXSpace: escapeConstants.radioButtonsXSpace,
        radioChoiceConfig: {
          circleDim: 15,
          checkedDim: 10,
          outlineThickness: 3
        },
        choiceTextConfig: { x: 0, y: -45, oriX: 0.5, oriY: 0.25 },
        bitmapTextStyle: volumeRadioOptTextStyle
      },
      escapeConstants.volOptXPos,
      escapeConstants.volOptYPos
    );

    volOptContainer.add([volumeText, this.volumeOptions]);
    return volOptContainer;
  }

  private createEscapeOptButton(text: string, xPos: number, yPos: number, callback: any) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return createButton(
      gameManager,
      {
        assetKey: ImageAssets.mediumButton.key,
        message: text,
        textConfig: { x: 0, y: 0, oriX: 0.37, oriY: 0.75 },
        bitMapTextStyle: escapeOptButtonStyle,
        onUp: callback
      },
      gameManager.soundManager
    ).setPosition(xPos, yPos);
  }

  private async applySettings() {
    if (this.volumeOptions) {
      // Save settings
      const volumeVal = parseFloat(this.volumeOptions.getChosenChoice());
      await GameGlobalAPI.getInstance().saveSettings({ volume: volumeVal });

      // Apply settings
      const newUserSetting = GameGlobalAPI.getInstance().getLoadedUserState();
      GameGlobalAPI.getInstance().applySoundSettings(newUserSetting);
    }
  }
}

export default GameEscapeManager;
