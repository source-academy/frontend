import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { IBaseScene, IGameUI } from '../commons/CommonTypes';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../effects/FlyEffect';
import { Layer } from '../layer/GameLayerTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos } from '../utils/StyleUtils';
import DashboardConstants, { pageBannerTextStyle } from './GameDashboardConstants';
import { DashboardPage, DashboardPageManager } from './GameDashboardTypes';

/**
 * Manager for the dashboard.
 *
 * Here, the dialogue log and task log are available for browsing.
 */
class GameDashboardManager implements IGameUI {
  private scene: IBaseScene;
  private pages: DashboardPage[];
  private pageManagers: DashboardPageManager[];

  private pageMask: Phaser.Display.Masks.GeometryMask;
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private pageChosenContainer: Phaser.GameObjects.Container | undefined;
  private pageUIContainers: Phaser.GameObjects.Container[];
  private currPageIndex: number;

  constructor(scene: IBaseScene, pages: DashboardPage[], pageManagers: DashboardPageManager[]) {
    this.scene = scene;
    this.pages = pages;
    this.pageManagers = pageManagers;
    this.pageMask = this.createPageMask();
    // Used to store each page's UI so they only get created once each time dashboard is opened.
    this.pageUIContainers = new Array(pages.length);
    this.currPageIndex = 0; // Use first page as starting page
    this.scene.getPhaseManager().addPhaseToMap(GamePhaseType.Dashboard, this);
  }

  /**
   * Creates the GeometryMask through which each page's UI can be seen.
   */
  private createPageMask() {
    const shape = new Phaser.GameObjects.Graphics(this.scene);
    // This is the rectangle of the background image
    const { x, y, width, height } = DashboardConstants.pageArea;
    shape.fillRect(x, y, width, height);
    return shape.createGeometryMask();
  }

  /**
   * Change the current page in view to a new page.
   *
   * Internally, create a container for each page when the page is first
   * opened or retrieve the container from cache if opened before;
   * also sets up the blue outline that denotes that the page is chosen.
   *
   * @param pageIndex new page
   */
  private setPage(pageIndex: number) {
    if (this.uiContainer) {
      if (this.pageChosenContainer) this.pageChosenContainer.destroy();

      // Hide current page
      const currPageUIContainer = this.pageUIContainers[this.currPageIndex];
      // Only time currPageUIContainer does not exist here is when
      // the dashboard is opened and the first page is set.
      if (currPageUIContainer) {
        currPageUIContainer.setVisible(false);
      }

      // Show selected page
      this.currPageIndex = pageIndex;
      let newPageUIContainer = this.pageUIContainers[this.currPageIndex];
      if (!newPageUIContainer) {
        // First time opening this page, UI container not created yet
        newPageUIContainer = this.pageManagers[this.currPageIndex].createUIContainer();
        newPageUIContainer.setMask(this.pageMask);
        this.pageUIContainers[this.currPageIndex] = newPageUIContainer;
        this.uiContainer.add(newPageUIContainer);
      } else {
        newPageUIContainer.setVisible(true);
      }

      // Set chosen page banner
      const bannerPos = this.getPageOptPositions();
      const chosenIdx = this.currPageIndex;
      const bannerChosen = new Phaser.GameObjects.Sprite(
        this.scene,
        bannerPos[chosenIdx][0],
        bannerPos[chosenIdx][1] + DashboardConstants.page.yStart,
        ImageAssets.awardsPageChosen.key
      );
      this.pageChosenContainer = new Phaser.GameObjects.Container(this.scene, 0, 0, [bannerChosen]);
      this.uiContainer.add(this.pageChosenContainer);
    }
  }

  /**
   * Create the container that encapsulate the 'Dashboard' UI.
   */
  private createUIContainer() {
    const dashboardContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    const blackUnderlay = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      screenSize.x,
      4 * screenSize.y,
      0
    )
      .setAlpha(0.7)
      .setInteractive();

    const dashboardBg = new Phaser.GameObjects.Image(this.scene, 0, 0, ImageAssets.awardsMenu.key);
    dashboardContainer.add([blackUnderlay, dashboardBg]);

    // Add options
    const pageOptButtons = this.pages.map((page, pageIndex) => {
      return {
        text: page,
        callback: () => this.setPage(pageIndex)
      };
    });
    const pageOptButtonPositions = this.getPageOptPositions();
    dashboardContainer.add(
      pageOptButtons.map((button, index) =>
        this.createPageOpt(
          button.text,
          pageOptButtonPositions[index][0],
          pageOptButtonPositions[index][1] + DashboardConstants.page.yStart,
          button.callback
        )
      )
    );

    // Add back button
    const backButton = this.createPageOpt('Back', 0, DashboardConstants.backButton.y, async () => {
      if (this.scene.getPhaseManager().isCurrentPhase(GamePhaseType.Dashboard)) {
        await this.scene.getPhaseManager().popPhase();
      }
    });
    dashboardContainer.add(backButton);

    return dashboardContainer;
  }

  /**
   * Get positions of the page options.
   */
  private getPageOptPositions() {
    return calcListFormatPos({
      numOfItems: Object.keys(DashboardPage).length,
      xSpacing: 0,
      ySpacing: DashboardConstants.page.ySpace
    });
  }

  /**
   * Format the button information to a UI container, complete with
   * styling and functionality. This button represent the page option button,
   * whether it is 'log' or 'tasks'
   *
   * @param text text to be displayed on the button
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param callback callback to be executed on click
   */
  private createPageOpt(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(this.scene, {
      assetKey: ImageAssets.awardsPage.key,
      message: text,
      textConfig: DashboardConstants.pageTextConfig,
      bitMapTextStyle: pageBannerTextStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  /**
   * Activate the 'Dashboard' UI.
   *
   * Usually only called by the phase manager when 'Dashboard' phase is
   * pushed.
   */
  public async activateUI(): Promise<void> {
    this.uiContainer = this.createUIContainer();
    this.scene.getLayerManager().addToLayer(Layer.Dashboard, this.uiContainer);
    this.getSoundManager().playSound(SoundAssets.menuEnter.key);

    // Set initial page
    this.setPage(this.currPageIndex);

    this.uiContainer.setPosition(screenCenter.x, -screenSize.y);
    this.pageMask.geometryMask.setPosition(screenCenter.x, -screenSize.y);

    this.scene.tweens.add({
      targets: [this.uiContainer, this.pageMask.geometryMask],
      ...entryTweenProps,
      y: screenCenter.y
    });
  }

  /**
   * Deactivate the 'Dashboard' UI.
   *
   * Usually only called by the phase manager when 'Dashboard' phase is
   * transitioned out.
   */
  public async deactivateUI(): Promise<void> {
    if (this.uiContainer) {
      // Reload page UIs next time dashboard is opened
      this.pageUIContainers = new Array(this.pages.length);

      this.uiContainer.setPosition(this.uiContainer.x, this.uiContainer.y);
      this.getSoundManager().playSound(SoundAssets.menuExit.key);

      this.scene.tweens.add({
        targets: [this.uiContainer, this.pageMask.geometryMask],
        ...exitTweenProps
      });

      await sleep(exitTweenProps.duration);
      fadeAndDestroy(this.scene, this.uiContainer, { fadeDuration: 50 });
    }
  }

  private getSoundManager = () => SourceAcademyGame.getInstance().getSoundManager();
}

export default GameDashboardManager;
