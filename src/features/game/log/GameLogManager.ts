import { IBaseScene } from '../commons/CommonTypes';
import DashboardConstants from '../dashboard/GameDashboardConstants';
import { DashboardPageManager } from '../dashboard/GameDashboardTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { limitNumber } from '../utils/GameUtils';
import { createBitmapText } from '../utils/TextUtils';
import LogConstants, { logTextStyle } from './GameLogConstants';

/**
 * Manager in charge of creating the game log
 */
class GameLogManager implements DashboardPageManager {
  private scene: IBaseScene;

  /**
   * Initialises the game log UI
   *
   * @param scene - the scene to add game log
   */
  public constructor(scene: IBaseScene) {
    this.scene = scene;
  }

  /**
   * Creates the container that encapsulates the 'Game Log' UI,
   * i.e. the scrollable text and the scrollbar
   */
  public createUIContainer() {
    const logContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    const textLog = GameGlobalAPI.getInstance().getDialogueStorage();
    if (textLog.length === 0) {
      // No text to show
      return logContainer;
    }

    // Scrollable Text
    const bitmapText = createBitmapText(
      this.scene,
      textLog.join('\n\n'),
      LogConstants.logTextConfig,
      logTextStyle
    ).setMaxWidth(LogConstants.textMaxWidth);

    const textMinY =
      LogConstants.logTextConfig.y - Math.max(bitmapText.height - LogConstants.logHeight, 0);
    bitmapText.y = textMinY; // Show most recent text on screen first
    logContainer.add(bitmapText);

    // Scrollbar
    const scrollbarTrack = new Phaser.GameObjects.Rectangle(
      this.scene,
      LogConstants.scrollbarTrack.x,
      LogConstants.scrollbarTrack.y,
      LogConstants.scrollbarTrack.width,
      LogConstants.scrollbarTrack.height,
      LogConstants.scrollbarTrack.color
    );

    const scrollbarThumbHeight = Math.max(
      (LogConstants.logHeight / bitmapText.height) * LogConstants.scrollbarTrack.height,
      LogConstants.scrollbarThumb.width * 4 // Limit how small thumb can be
    );
    const scrollbarThumbMaxY =
      LogConstants.scrollbarTrack.y +
      LogConstants.scrollbarTrack.height / 2 -
      scrollbarThumbHeight / 2;
    // The total distance the thumb can move
    const thumbRange = LogConstants.scrollbarTrack.height - scrollbarThumbHeight;
    // The ratio between how far the thumb moves to how far the text scrolls
    const thumbTextScrollRatio = thumbRange / (LogConstants.logTextConfig.y - textMinY);

    const scrollbarThumb = new Phaser.GameObjects.Rectangle(
      this.scene,
      LogConstants.scrollbarThumb.x,
      scrollbarThumbMaxY,
      LogConstants.scrollbarThumb.width,
      scrollbarThumbHeight,
      LogConstants.scrollbarThumb.color
    );

    logContainer.add(scrollbarTrack);
    logContainer.add(scrollbarThumb);

    if (bitmapText.height <= LogConstants.logHeight) {
      // Hide scrollbar if all text fits on screen
      scrollbarTrack.setVisible(false);
      scrollbarThumb.setVisible(false);
    }

    // Add scroll listener
    const { x, y, width, height } = DashboardConstants.pageArea;
    const scrollZone = new Phaser.GameObjects.Zone(
      this.scene,
      x + width / 2,
      y + height / 2,
      width,
      height
    );
    scrollZone.setInteractive();
    scrollZone.on(
      'wheel',
      (pointer: Phaser.Input.Pointer, deltaX: number, deltaY: number, deltaZ: number) => {
        bitmapText.y = limitNumber(
          bitmapText.y - deltaY * LogConstants.scrollSpeed,
          textMinY,
          LogConstants.logTextConfig.y
        );
        scrollbarThumb.y = scrollbarThumbMaxY - (bitmapText.y - textMinY) * thumbTextScrollRatio;
      }
    );
    logContainer.add(scrollZone);

    return logContainer;
  }
}

export default GameLogManager;
