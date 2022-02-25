import { IBaseScene } from '../commons/CommonTypes';
import DashboardConstants from '../dashboard/GameDashboardConstants';
import { DashboardPageManager } from '../dashboard/GameDashboardTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { limitNumber } from '../utils/GameUtils';
import { createBitmapText } from '../utils/TextUtils';
import TaskConstants, { taskTextStyle } from './GameTaskLogConstants';

/**
 * Manager in charge of creating the task log
 */
class GameTaskLogManager implements DashboardPageManager {
  private scene: IBaseScene;

  /**
   * Initialises the task log UI
   *
   * @param scene - the scene to add task log
   */
  public constructor(scene: IBaseScene) {
    this.scene = scene;
  }

  /**
   * Creates the container that encapsulates the 'Task Log' UI,
   * i.e. the scrollable text and the scrollbar
   */
  public createUIContainer() {
    const taskLogContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    // Scrollable Text
    const tasksData = GameGlobalAPI.getInstance().getAllVisibleTaskData();
    let textDisplayed;
    if (tasksData.length === 0) {
      // No tasks to show
      textDisplayed = 'No tasks available.';
    } else {
      const completedTasks = tasksData
        .filter(([_, taskIsDone]) => taskIsDone)
        .map(([task, _]) => task);
      const incompleteTasks = tasksData
        .filter(([_, taskIsDone]) => !taskIsDone)
        .map(([task, _]) => task);
      const textsArray = [];
      if (completedTasks.length !== 0) {
        textsArray.push('Completed Tasks:\n');
        textsArray.push(
          completedTasks.map(task => `${task.title}\n${task.description}`).join('\n\n')
        );
        if (incompleteTasks.length !== 0) {
          // Line break between sections
          textsArray.push('\n');
        }
      }
      if (incompleteTasks.length !== 0) {
        textsArray.push('New Tasks:\n');
        textsArray.push(
          incompleteTasks.map(task => `${task.title}\n${task.description}`).join('\n\n')
        );
      }
      textDisplayed = textsArray.join('\n');
    }

    const bitmapText = createBitmapText(
      this.scene,
      textDisplayed,
      TaskConstants.taskTextConfig,
      taskTextStyle
    ).setMaxWidth(TaskConstants.textMaxWidth);

    const textMinY =
      TaskConstants.taskTextConfig.y - Math.max(bitmapText.height - TaskConstants.logHeight, 0);
    bitmapText.y = textMinY; // Show most recent text on screen first
    taskLogContainer.add(bitmapText);

    // Scrollbar
    const scrollbarTrack = new Phaser.GameObjects.Rectangle(
      this.scene,
      TaskConstants.scrollbarTrack.x,
      TaskConstants.scrollbarTrack.y,
      TaskConstants.scrollbarTrack.width,
      TaskConstants.scrollbarTrack.height,
      TaskConstants.scrollbarTrack.color
    );

    const scrollbarThumbHeight = Math.max(
      (TaskConstants.logHeight / bitmapText.height) * TaskConstants.scrollbarTrack.height,
      TaskConstants.scrollbarThumb.width * 4 // Limit how small thumb can be
    );
    const scrollbarThumbMaxY =
      TaskConstants.scrollbarTrack.y +
      TaskConstants.scrollbarTrack.height / 2 -
      scrollbarThumbHeight / 2;
    // The total distance the thumb can move
    const thumbRange = TaskConstants.scrollbarTrack.height - scrollbarThumbHeight;
    // The ratio between how far the thumb moves to how far the text scrolls
    const thumbTextScrollRatio = thumbRange / (TaskConstants.taskTextConfig.y - textMinY);

    const scrollbarThumb = new Phaser.GameObjects.Rectangle(
      this.scene,
      TaskConstants.scrollbarThumb.x,
      scrollbarThumbMaxY,
      TaskConstants.scrollbarThumb.width,
      scrollbarThumbHeight,
      TaskConstants.scrollbarThumb.color
    );

    taskLogContainer.add(scrollbarTrack);
    taskLogContainer.add(scrollbarThumb);

    if (bitmapText.height <= TaskConstants.logHeight) {
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
          bitmapText.y - deltaY * TaskConstants.scrollSpeed,
          textMinY,
          TaskConstants.taskTextConfig.y
        );
        scrollbarThumb.y = scrollbarThumbMaxY - (bitmapText.y - textMinY) * thumbTextScrollRatio;
      }
    );
    taskLogContainer.add(scrollZone);

    return taskLogContainer;
  }
}

export default GameTaskLogManager;
