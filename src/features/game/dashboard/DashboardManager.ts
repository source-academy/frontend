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
import DashboardConstants, { pageBannerTextStyle } from './DashboardConstants';
import { DashboardPage } from './DashboardTypes';

/**
 * Manager for the dashboard.
 *
 * Here, the dialogue log, quest log and achievements are
 * available for browsing.
 */
class GameDashboardManager implements IGameUI {
  private scene: IBaseScene;

  private uiContainer: Phaser.GameObjects.Container | undefined;
  private pageChosenContainer: Phaser.GameObjects.Container | undefined;
  private currActivePage: DashboardPage;

  constructor(scene: IBaseScene) {
    this.scene = scene;
    this.currActivePage = DashboardPage.Log;
    this.scene.getPhaseManager().addPhaseToMap(GamePhaseType.Dashboard, this);
  }

  /**
   * Change the current page in view to a new page.
   *
   * Internally, destroy and replace the containers to reflect
   * the new page; also sets up the blue outline that denotes
   * that the page is chosen.
   *
   * @param page new page
   */
  private setPage(page: DashboardPage) {
    if (this.uiContainer) {
      if (this.pageChosenContainer) this.pageChosenContainer.destroy();

      // Update
      this.currActivePage = page;

      // Set chosen page banner
      const bannerPos = this.getPageOptPositions();
      const chosenIdx = Object.keys(DashboardPage).findIndex(pg => pg === (page as string));
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
    const pageOptButtons = Object.keys(DashboardPage).map(page => {
      return {
        text: page,
        callback: () => this.setPage(page as DashboardPage)
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
   * whether it is 'log', 'quests' or 'achievements'.
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
    this.setPage(this.currActivePage);

    this.uiContainer.setPosition(screenCenter.x, -screenSize.y);

    this.scene.tweens.add({
      targets: this.uiContainer,
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
      this.uiContainer.setPosition(this.uiContainer.x, this.uiContainer.y);
      this.getSoundManager().playSound(SoundAssets.menuExit.key);

      this.scene.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(exitTweenProps.duration);
      fadeAndDestroy(this.scene, this.uiContainer, { fadeDuration: 50 });
    }
  }

  private getSoundManager = () => SourceAcademyGame.getInstance().getSoundManager();
}

export default GameDashboardManager;
