import ImageAssets from '../../assets/ImageAssets';
import SoundAssets from '../../assets/SoundAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { blackScreen } from '../../effects/FadeEffect';
import { putWorkerMessage } from '../../effects/WorkerMessage';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { mandatory } from '../../utils/GameUtils';
import { calcTableFormatPos, Direction } from '../../utils/StyleUtils';
import MainMenuConstants, { mainMenuStyle } from './MainMenuConstants';

/**
 * Main Menu
 *
 * User can navigate to other scenes from here.
 */
class MainMenu extends Phaser.Scene {
  private layerManager?: GameLayerManager;

  constructor() {
    super('MainMenu');
  }

  public async create() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.layerManager = new GameLayerManager(this);
    this.renderBackground();
    this.renderOptionButtons();

    putWorkerMessage(this, 'T', screenCenter.x * 1.12, screenCenter.y * 1.1);

    SourceAcademyGame.getInstance().getSoundManager().playBgMusic(SoundAssets.galacticHarmony.key);
  }

  /**
   * Render background image for the main menu.
   */
  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.spaceshipBg.key
    ).setDisplaySize(screenSize.x, screenSize.y);
    const blackOverlay = blackScreen(this).setAlpha(0.15);
    const saBanner = new Phaser.GameObjects.Image(
      this,
      MainMenuConstants.saBanner.x,
      MainMenuConstants.saBanner.y,
      ImageAssets.saBanner.key
    ).setAlpha(0.7);
    this.getLayerManager().addToLayer(Layer.Background, backgroundImg);
    this.getLayerManager().addToLayer(Layer.Background, blackOverlay);
    this.getLayerManager().addToLayer(Layer.Background, saBanner);
  }

  /**
   * Render all the buttons for the main menu.
   * Selection of buttons is detailed at getOptionButtons().
   */
  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = this.getOptionButtons();

    const buttonPositions = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: buttons.length,
      maxYSpace: MainMenuConstants.button.ySpace
    });

    optionsContainer.add(
      buttons.map((button, index) =>
        this.createOptionButton(
          button.text,
          buttonPositions[index][0] + MainMenuConstants.banner.xHide,
          buttonPositions[index][1],
          button.callback
        )
      )
    );

    this.getLayerManager().addToLayer(Layer.UI, optionsContainer);
  }

  /**
   * Format a main menu button with the given text; attach a callback
   * and position it at the given xPos and yPos.
   *
   * @param text text to be displayed on the button
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param callback callback to be attached to the button
   */
  private createOptionButton(text: string, xPos: number, yPos: number, callback: any) {
    // Animation to trigger on Hover and off Hover
    const tweenOnHover = (target: Phaser.GameObjects.Container) => {
      this.tweens.add({
        targets: target,
        ...MainMenuConstants.onFocusTween
      });
    };
    const tweenOffHover = (target: Phaser.GameObjects.Container) => {
      this.tweens.add({
        targets: target,
        ...MainMenuConstants.outFocusTween
      });
    };

    // Create button with main menu style
    const optButton: Phaser.GameObjects.Container = createButton(this, {
      assetKey: ImageAssets.mainMenuOptBanner.key,
      message: text,
      textConfig: MainMenuConstants.buttonTextConfig,
      bitMapTextStyle: mainMenuStyle,
      onUp: callback,
      onHover: () => tweenOnHover(optButton),
      onOut: () => tweenOffHover(optButton),
      onHoverEffect: false
    }).setPosition(xPos, yPos);

    return optButton;
  }

  /**
   * Return all the buttons available at main menu,
   * as well as their callbacks.
   */
  private getOptionButtons() {
    return [
      {
        text: MainMenuConstants.text.chapterSelect,
        callback: () => {
          this.getLayerManager().clearAllLayers();
          this.scene.start('ChapterSelect');
        }
      },
      {
        text: MainMenuConstants.text.awards,
        callback: () => {
          this.getLayerManager().clearAllLayers();
          this.scene.start('AwardsHall');
        }
      },
      {
        text: MainMenuConstants.text.studentRoom,
        callback: () => {
          this.getLayerManager().clearAllLayers();
          this.scene.start('RoomPreview');
        }
      },
      {
        text: MainMenuConstants.text.settings,
        callback: () => {
          this.getLayerManager().clearAllLayers();
          this.scene.start('Settings');
        }
      },
      {
        text: MainMenuConstants.text.bindings,
        callback: () => {
          this.getLayerManager().clearAllLayers();
          this.scene.start('Bindings');
        }
      }
    ];
  }
  public getLayerManager = () => mandatory(this.layerManager);
}

export default MainMenu;
