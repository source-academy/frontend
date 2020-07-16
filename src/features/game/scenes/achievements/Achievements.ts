import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter } from '../../commons/CommonConstants';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { createEmptySaveState } from '../../save/GameSaveConstants';
import { FullSaveState } from '../../save/GameSaveTypes';
import GameSoundManager from '../../sound/GameSoundManager';
import GameUserStateManager from '../../state/GameUserStateManager';
import { limitNumber } from '../../utils/GameUtils';
import { calcTableFormatPosColWise } from '../../utils/StyleUtils';
import { AchievementConstants } from './AchievementConstants';

type AchievementsProps = {
  fullSaveState: FullSaveState;
};

/**
 * This scenes display all students achievement.
 */
class Achievements extends Phaser.Scene {
  public fullSaveState: FullSaveState;

  public layerManager: GameLayerManager;
  public soundManager: GameSoundManager;
  public inputManager: GameInputManager;
  private userStateManager: GameUserStateManager;

  private backgroundTile: Phaser.GameObjects.TileSprite | undefined;
  private achievementsContainer: Phaser.GameObjects.Container | undefined;

  private isScrollLeft: boolean;
  private isScrollRight: boolean;
  private scrollLim: number;

  constructor() {
    super('Achievements');
    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.inputManager = new GameInputManager();
    this.userStateManager = new GameUserStateManager();

    this.fullSaveState = createEmptySaveState();

    this.isScrollLeft = false;
    this.isScrollRight = false;
    this.scrollLim = 0;
  }

  public init({ fullSaveState }: AchievementsProps) {
    this.fullSaveState = fullSaveState;

    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.inputManager = new GameInputManager();
    this.userStateManager = new GameUserStateManager();
  }

  public preload() {
    addLoadingScreen(this);
    this.userStateManager.initialise(this.fullSaveState.userState);
    this.soundManager.initialise(this, getSourceAcademyGame());
    this.layerManager.initialise(this);
    this.inputManager.initialise(this);
    this.scrollLim =
      Math.ceil(
        this.userStateManager.getList('achievements').length /
          AchievementConstants.maxAchievementPerCol
      ) * AchievementConstants.achievementXSpacing;
  }

  public create() {
    this.renderBackground();
    this.renderAchievements();
  }

  public update() {
    if (!this.backgroundTile || !this.achievementsContainer) return;

    let newXPos = this.backgroundTile.x;
    if (this.isScrollRight) {
      newXPos -= 20;
    } else if (this.isScrollLeft) {
      newXPos += 20;
    }
    // TODO: Find scroll lim
    newXPos = limitNumber(newXPos, -this.scrollLim, 0);

    this.backgroundTile.tilePositionX = newXPos;
    this.achievementsContainer.x = newXPos;
  }

  private renderBackground() {
    if (this.backgroundTile) this.backgroundTile.destroy();

    // TODO: Find proper background
    this.backgroundTile = new Phaser.GameObjects.TileSprite(
      this,
      screenCenter.x,
      screenCenter.y,
      AchievementConstants.tileDim,
      AchievementConstants.tileDim,
      'a'
    );
    this.layerManager.addToLayer(Layer.Background, this.backgroundTile);

    const backButton = new CommonBackButton(this, () => {
      this.cleanUp();
      this.scene.start('MainMenu');
    });
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private renderAchievements() {
    if (this.achievementsContainer) this.achievementsContainer.destroy();

    this.achievementsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const achievements = this.getAchievements(this.userStateManager.getList('achievements'));
    const achievementsPos = calcTableFormatPosColWise({
      numOfItems: achievements.length,
      maxXSpace: this.scrollLim
    });

    this.achievementsContainer.add(
      achievements.map((achievement, index) =>
        this.createAchievement(achievement, achievementsPos[index][0], achievementsPos[index][1])
      )
    );
    this.layerManager.addToLayer(Layer.Objects, this.achievementsContainer);
  }

  private getAchievements(achievements: string[]) {
    // TODO: Find the mapping to the asset, attach callbacks, etc
    return achievements;
  }

  private createAchievement(achievement: string, xPos: number, yPos: number) {
    const achievementCont = new Phaser.GameObjects.Container(this, xPos, yPos);
    // TODO: Use asset
    return achievementCont;
  }

  private cleanUp() {
    this.soundManager.stopCurrBgMusic();
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }
}

export default Achievements;
