import ImageAssets from '../../assets/ImageAssets';
import { getAwardProps } from '../../awards/GameAwardsHelper';
import { AwardProperty } from '../../awards/GameAwardsTypes';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { UserStateTypes } from '../../state/GameStateTypes';
import GameUserStateManager from '../../state/GameUserStateManager';
import { createButton } from '../../utils/ButtonUtils';
import { limitNumber } from '../../utils/GameUtils';
import { resizeUnderflow } from '../../utils/SpriteUtils';
import { calcTableFormatPos, Direction } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import { awardBannerTextStyle, AwardsHallConstants } from './AwardsHallConstants';
import { createAwardsHoverContainer } from './AwardsHelper';

/**
 * This scenes display all students awards (collectibles and achievements).
 */
class AwardsHall extends Phaser.Scene {
  public layerManager: GameLayerManager;
  public inputManager: GameInputManager;
  private userStateManager: GameUserStateManager;

  private backgroundTile: Phaser.GameObjects.TileSprite | undefined;
  private awardsContainer: Phaser.GameObjects.Container | undefined;

  private isScrollLeft: boolean;
  private isScrollRight: boolean;
  private scrollLim: number;
  private awardXSpace: number;

  constructor() {
    super('AwardsHall');
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);

    this.layerManager = new GameLayerManager();
    this.inputManager = new GameInputManager();
    this.userStateManager = new GameUserStateManager();

    this.isScrollLeft = false;
    this.isScrollRight = false;
    this.scrollLim = 0;
    this.awardXSpace = 0;
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
  }

  public async create() {
    await this.userStateManager.loadAchievements();

    // Calculate the maximum horizontal space required based
    // on maximum number of achievement/collectible
    const achievementLength = this.userStateManager.getList(UserStateTypes.achievements).length;
    const collectibleLength = this.userStateManager.getList(UserStateTypes.achievements).length;
    this.awardXSpace =
      Math.ceil(
        Math.max(achievementLength, collectibleLength) / AwardsHallConstants.maxAwardsPerCol
      ) * AwardsHallConstants.awardsXSpacing;

    // Scroll limit is anything that exceed the screen size
    this.scrollLim = this.awardXSpace < screenSize.x ? 0 : this.awardXSpace - screenSize.x;
    this.renderBackground();
    this.renderAwards();
  }

  public update() {
    if (!this.backgroundTile || !this.awardsContainer) return;

    // Scroll the awards hall if button is currently clicked/held down
    let newXPos = this.awardsContainer.x;
    if (this.isScrollRight) {
      newXPos -= AwardsHallConstants.defaultScrollSpeed;
    } else if (this.isScrollLeft) {
      newXPos += AwardsHallConstants.defaultScrollSpeed;
    }
    newXPos = limitNumber(newXPos, -this.scrollLim, 0);

    // To achieve seamless background, we need to scroll on .tilePosition for background
    this.backgroundTile.tilePositionX = -newXPos;
    this.awardsContainer.x = newXPos;
  }

  /**
   * Render background of this scene, as well as its
   * UI elements (arrows, backbutton, as well as the 'Collectible' and 'Achievement' banner).
   */
  private renderBackground() {
    if (this.backgroundTile) this.backgroundTile.destroy();

    this.backgroundTile = new Phaser.GameObjects.TileSprite(
      this,
      0,
      0,
      AwardsHallConstants.tileDim,
      AwardsHallConstants.tileDim,
      ImageAssets.awardsBackground.key
    ).setOrigin(0, 0.25);
    this.layerManager.addToLayer(Layer.Background, this.backgroundTile);

    // Add banners
    const banners = ['Achievements', 'Collectibles'];
    const bannerPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: banners.length
    });
    banners.forEach((banner, index) => {
      const bannerCont = this.createBanner(banner, bannerPos[index][1]);
      this.layerManager.addToLayer(Layer.UI, bannerCont);
    });

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

  /**
   * Render all the awards that student has.
   */
  private renderAwards() {
    if (this.awardsContainer) this.awardsContainer.destroy();

    this.awardsContainer = new Phaser.GameObjects.Container(this, 0, 0);

    // Achievement
    const achievements = this.getAwards(UserStateTypes.achievements);
    const achievementsPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: achievements.length,
      maxXSpace: this.awardXSpace,
      maxYSpace: AwardsHallConstants.awardYSpace
    });

    // Achievement is positioned on the upper half of the screen
    this.awardsContainer.add(
      achievements.map((achievement, index) =>
        this.createAward(
          achievement,
          achievementsPos[index][0],
          achievementsPos[index][1] + AwardsHallConstants.awardYStartPos - screenCenter.y
        )
      )
    );

    // Collectible
    const collectibles = this.getAwards(UserStateTypes.collectibles);
    const collectiblesPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: collectibles.length,
      maxXSpace: this.awardXSpace,
      maxYSpace: AwardsHallConstants.awardYSpace
    });

    // Collectible is positioned on the lower half of the screen
    this.awardsContainer.add(
      collectibles.map((collectible, index) =>
        this.createAward(
          collectible,
          collectiblesPos[index][0],
          collectiblesPos[index][1] + AwardsHallConstants.awardYStartPos
        )
      )
    );

    this.layerManager.addToLayer(Layer.Objects, this.awardsContainer);
  }

  /**
   * Fetch awardProps based on the type from the user state manager.
   * @param type
   */
  private getAwards(type: UserStateTypes) {
    const keys = this.userStateManager.getList(type);
    const awardProps = getAwardProps(keys);
    return awardProps;
  }

  /**
   * Format the given award; giving it a pop up hover of its
   * description, resize it to the correct size, and position it
   * based on the given xPos and yPos.
   *
   * @param award awardProperty to be used
   * @param xPos x position of the award
   * @param yPos y position of the award
   */
  private createAward(award: AwardProperty, xPos: number, yPos: number) {
    const awardCont = new Phaser.GameObjects.Container(this, xPos, yPos);
    const image = new Phaser.GameObjects.Sprite(this, 0, 0, award.assetKey).setOrigin(0.5);
    const hoverCont = createAwardsHoverContainer(this, award);

    resizeUnderflow(image, AwardsHallConstants.awardDim, AwardsHallConstants.awardDim);

    // Set up the pop up
    image.setInteractive({ pixelPerfect: true, useHandCursor: true });
    image.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
      hoverCont.setVisible(true)
    );
    image.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
      hoverCont.setVisible(false)
    );
    image.addListener(
      Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE,
      (pointer: Phaser.Input.Pointer) => {
        hoverCont.x = pointer.x + 10;
        hoverCont.y = pointer.y - 10;
      }
    );

    this.layerManager.addToLayer(Layer.UI, hoverCont);
    awardCont.add(image);
    return awardCont;
  }

  /**
   * Clean up of related managers
   */
  private cleanUp() {
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }

  /**
   * Format the given text with banner style.
   *
   * In-game, this is the achievement & collectible banner
   * that is positioned on the left hand side.
   *
   * @param text text to be put on the banner
   * @param yPos y position of the banner
   */
  private createBanner(text: string, yPos: number) {
    const bannerContainer = new Phaser.GameObjects.Container(this, 0, yPos);
    const bannerBg = new Phaser.GameObjects.Sprite(
      this,
      AwardsHallConstants.bannerXOffset,
      0,
      ImageAssets.awardsPage.key
    );
    const bannerText = createBitmapText(
      this,
      text,
      AwardsHallConstants.bannerTextConfig,
      awardBannerTextStyle
    );
    bannerContainer.add([bannerBg, bannerText]);
    return bannerContainer;
  }
}

export default AwardsHall;
