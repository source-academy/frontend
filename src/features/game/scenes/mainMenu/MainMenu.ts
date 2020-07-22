import ImageAssets from '../../assets/ImageAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { calcTableFormatPos, Direction } from '../../utils/StyleUtils';
import mainMenuConstants, { mainMenuStyle } from './MainMenuConstants';

/**
 * Main Menu
 *
 * User can navigate to other scenes from here.
 */
class MainMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;

  constructor() {
    super('MainMenu');

    this.layerManager = new GameLayerManager();
  }

  public preload() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.layerManager.initialise(this);
  }

  public async create() {
    this.renderBackground();
    this.renderOptionButtons();
  }

  /**
   * Render background image for the main menu.
   */
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
        ...mainMenuConstants.onFocusOptTween
      });
    };
    const tweenOffHover = (target: Phaser.GameObjects.Container) => {
      this.tweens.add({
        targets: target,
        ...mainMenuConstants.outFocusOptTween
      });
    };

    // Create button with main menu style
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

  /**
   * Return all the buttons available at main menu,
   * as well as their callbacks.
   */
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
          this.scene.start('RoomPreview');
        }
      },
      {
        text: mainMenuConstants.optionsText.settings,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('Settings');
        }
      },
      {
        text: mainMenuConstants.optionsText.bindings,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('Bindings');
        }
      }
    ];
  }
}

export default MainMenu;
