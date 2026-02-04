import { IBaseScene } from '../commons/CommonTypes';
import DashboardConstants from '../dashboard/GameDashboardConstants';
import { DashboardPageManager } from '../dashboard/GameDashboardTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { limitNumber } from '../utils/GameUtils';
import { createBitmapText } from '../utils/TextUtils';
import TaskLogConstants, { taskTextStyle } from './GameTaskLogConstants';

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
   * i.e. the scrollable text, the check marks and the scrollbar
   */
  public createUIContainer() {
    const taskLogContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    // Scrollable Text and Check Marks
    const tasksData = GameGlobalAPI.getInstance().getAllVisibleTaskData();
    const taskListContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);
    let totalTextHeight = 0;

    if (tasksData.length === 0) {
      // No tasks to show
      const message = createBitmapText(
        this.scene,
        'No tasks available.',
        TaskLogConstants.taskTextConfig,
        taskTextStyle
      ).setMaxWidth(TaskLogConstants.textMaxWidth);
      taskListContainer.add(message);
      totalTextHeight = message.height;
    } else {
      for (let i = 0; i < tasksData.length; i++) {
        const task = tasksData[i][0];
        const taskIsDone = tasksData[i][1];

        if (taskIsDone) {
          // Show a check mark next to completed tasks
          const checkMark = new Phaser.GameObjects.Image(
            this.scene,
            TaskLogConstants.checkMark.x,
            TaskLogConstants.checkMark.y + totalTextHeight,
            TaskLogConstants.checkMark.imageUrl
          );
          taskListContainer.add(checkMark);
        }

        const taskTitle = createBitmapText(
          this.scene,
          task.title,
          {
            ...TaskLogConstants.taskTextConfig,
            y: TaskLogConstants.taskTextConfig.y + totalTextHeight
          },
          taskTextStyle
        ).setMaxWidth(TaskLogConstants.textMaxWidth);

        // Underline the task title using a stretched underscore
        // (Note: this will not underline subsequent lines if title longer than 1 line)
        const underline = createBitmapText(
          this.scene,
          '_',
          {
            ...TaskLogConstants.taskTextConfig,
            y: TaskLogConstants.taskTextConfig.y + totalTextHeight
          },
          taskTextStyle
        );
        underline.setScale(taskTitle.width / underline.width, 1);

        taskListContainer.add(taskTitle);
        taskListContainer.add(underline);
        totalTextHeight += taskTitle.height;

        const taskDescription = createBitmapText(
          this.scene,
          task.description + (i < tasksData.length - 1 ? '\n ' : ''), // Line break between tasks
          {
            ...TaskLogConstants.taskTextConfig,
            y: TaskLogConstants.taskTextConfig.y + totalTextHeight
          },
          taskTextStyle
        ).setMaxWidth(TaskLogConstants.textMaxWidth);

        taskListContainer.add(taskDescription);
        totalTextHeight += taskDescription.height;
      }
    }

    const taskListContainerMinY = -Math.max(totalTextHeight - TaskLogConstants.logHeight, 0);
    taskListContainer.y = taskListContainerMinY; // Show newest tasks on screen first
    taskLogContainer.add(taskListContainer);

    // Scrollbar
    const scrollbarTrack = new Phaser.GameObjects.Rectangle(
      this.scene,
      TaskLogConstants.scrollbarTrack.x,
      TaskLogConstants.scrollbarTrack.y,
      TaskLogConstants.scrollbarTrack.width,
      TaskLogConstants.scrollbarTrack.height,
      TaskLogConstants.scrollbarTrack.color
    );

    const scrollbarThumbHeight = Math.max(
      (TaskLogConstants.logHeight / totalTextHeight) * TaskLogConstants.scrollbarTrack.height,
      TaskLogConstants.scrollbarThumb.width * 4 // Limit how small thumb can be
    );
    const scrollbarThumbMaxY =
      TaskLogConstants.scrollbarTrack.y +
      TaskLogConstants.scrollbarTrack.height / 2 -
      scrollbarThumbHeight / 2;
    // The total distance the thumb can move
    const thumbRange = TaskLogConstants.scrollbarTrack.height - scrollbarThumbHeight;
    // The ratio between how far the thumb moves to how far the text scrolls
    const thumbTextScrollRatio = thumbRange / -taskListContainerMinY;

    const scrollbarThumb = new Phaser.GameObjects.Rectangle(
      this.scene,
      TaskLogConstants.scrollbarThumb.x,
      scrollbarThumbMaxY,
      TaskLogConstants.scrollbarThumb.width,
      scrollbarThumbHeight,
      TaskLogConstants.scrollbarThumb.color
    );

    taskLogContainer.add(scrollbarTrack);
    taskLogContainer.add(scrollbarThumb);

    if (totalTextHeight <= TaskLogConstants.logHeight) {
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
        taskListContainer.y = limitNumber(
          taskListContainer.y - deltaY * TaskLogConstants.scrollSpeed,
          taskListContainerMinY,
          0
        );
        scrollbarThumb.y =
          scrollbarThumbMaxY - (taskListContainer.y - taskListContainerMinY) * thumbTextScrollRatio;
      }
    );
    taskLogContainer.add(scrollZone);

    return taskLogContainer;
  }
}

export default GameTaskLogManager;
