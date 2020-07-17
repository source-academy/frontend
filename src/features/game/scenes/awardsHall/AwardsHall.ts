import SourceAcademyGame from 'src/pages/academy/game/subcomponents/SourceAcademyGame';

import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter } from '../../commons/CommonConstants';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { UserStateTypes } from '../../state/GameStateTypes';
import GameUserStateManager from '../../state/GameUserStateManager';
import { createButton } from '../../utils/ButtonUtils';
import { limitNumber } from '../../utils/GameUtils';
import { calcTableFormatPos } from '../../utils/StyleUtils';
import { AwardsHallConstants } from './AwardsHallConstants';

/**
 * This scenes display all students achievement.
 */
class AwardsHall extends Phaser.Scene {
  public layerManager: GameLayerManager;
  public inputManager: GameInputManager;
  private userStateManager: GameUserStateManager;

  private backgroundTile: Phaser.GameObjects.TileSprite | undefined;
  private achievementsContainer: Phaser.GameObjects.Container | undefined;

  private isScrollLeft: boolean;
  private isScrollRight: boolean;
  private scrollLim: number;

  constructor() {
    super('AwardsHall');
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);

    this.layerManager = new GameLayerManager();
    this.inputManager = new GameInputManager();
    this.userStateManager = new GameUserStateManager();

    this.isScrollLeft = false;
    this.isScrollRight = false;
    this.scrollLim = 0;
  }

  public init() {
    this.layerManager = new GameLayerManager();
    this.inputManager = new GameInputManager();
    this.userStateManager = new GameUserStateManager();
  }

  public preload() {
    addLoadingScreen(this);
    this.userStateManager.initialise();
    this.layerManager.initialise(this);
    this.inputManager.initialise(this);
    this.scrollLim =
      Math.ceil(
        this.userStateManager.getList(UserStateTypes.achievements).length /
          AwardsHallConstants.maxAwardsPerCol
      ) * AwardsHallConstants.awardsXSpacing;
  }

  public create() {
    this.renderBackground();
    this.renderAchievements();
  }

  public update() {
    if (!this.backgroundTile || !this.achievementsContainer) return;

    let newXPos = this.backgroundTile.x;
    if (this.isScrollRight) {
      newXPos -= AwardsHallConstants.defaultScrollSpeed;
    } else if (this.isScrollLeft) {
      newXPos += AwardsHallConstants.defaultScrollSpeed;
    }
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
      AwardsHallConstants.tileDim,
      AwardsHallConstants.tileDim,
      'a'
    );
    this.layerManager.addToLayer(Layer.Background, this.backgroundTile);

    const leftArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onDown: () => (this.isScrollLeft = true),
      onUp: () => (this.isScrollLeft = false),
      onOut: () => (this.isScrollLeft = false)
    }).setPosition(screenCenter.x - AwardsHallConstants.arrowXOffset, screenCenter.y);

    const rightArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onDown: () => (this.isScrollRight = true),
      onUp: () => (this.isScrollRight = false),
      onOut: () => (this.isScrollRight = false)
    })
      .setPosition(screenCenter.x + AwardsHallConstants.arrowXOffset, screenCenter.y)
      .setScale(-1, 1);

    const backButton = new CommonBackButton(this, () => {
      this.cleanUp();
      this.scene.start('MainMenu');
    });
    this.layerManager.addToLayer(Layer.UI, leftArrow);
    this.layerManager.addToLayer(Layer.UI, rightArrow);
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private renderAchievements() {
    if (this.achievementsContainer) this.achievementsContainer.destroy();

    this.achievementsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const achievements = this.getAchievements();
    const achievementsPos = calcTableFormatPos({
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

  private getAchievements() {
    const achievements = this.userStateManager.getList(UserStateTypes.achievements);
    // TODO: Find the mapping to the asset, attach callbacks, etc
    return achievements;
  }

  private createAchievement(achievement: string, xPos: number, yPos: number) {
    const achievementCont = new Phaser.GameObjects.Container(this, xPos, yPos);
    // TODO: Use asset
    return achievementCont;
  }

  private cleanUp() {
    SourceAcademyGame.getInstance().getSoundManager().stopCurrBgMusic();
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }
}

export default AwardsHall;
