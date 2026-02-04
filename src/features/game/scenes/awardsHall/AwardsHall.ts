import ImageAssets from '../../assets/ImageAssets';
import { getAwardProps } from '../../awards/GameAwardsHelper';
import { AwardProperty } from '../../awards/GameAwardsTypes';
import CommonBackButton from '../../commons/CommonBackButton';
import { Constants, screenCenter, screenSize } from '../../commons/CommonConstants';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import { putWorkerMessage } from '../../effects/WorkerMessage';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { limitNumber, mandatory } from '../../utils/GameUtils';
import { resizeUnderflow } from '../../utils/SpriteUtils';
import { calcTableFormatPos, Direction, HexColor } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import {
  awardBannerTextStyle,
  awardNoAssetTitleStyle,
  AwardsHallConstants
} from './AwardsHallConstants';
import { createAwardsHoverContainer } from './AwardsHallHelper';

/**
 * This scenes display all students awards (collectibles and achievements).
 */
class AwardsHall extends Phaser.Scene {
  public layerManager?: GameLayerManager;
  public inputManager?: GameInputManager;

  private backgroundTile: Phaser.GameObjects.TileSprite | undefined;
  private awardsContainer: Phaser.GameObjects.Container | undefined;

  private isScrollLeft: boolean;
  private isScrollRight: boolean;
  private scrollLim: number;
  private awardXSpace: number;

  constructor() {
    super('AwardsHall');
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);

    this.isScrollLeft = false;
    this.isScrollRight = false;
    this.scrollLim = 0;
    this.awardXSpace = 0;
  }

  public init() {
    this.layerManager = new GameLayerManager(this);
    this.inputManager = new GameInputManager(this);
  }

  public preload() {
    addLoadingScreen(this);
  }

  public async create() {
    // Calculate the maximum horizontal space required based
    // on maximum number of achievement/collectible
    const achievementLength = this.getUserStateManager().getAchievements().length;
    const collectibleLength = this.getUserStateManager().getCollectibles().length;
    this.awardXSpace =
      Math.ceil(
        Math.max(achievementLength, collectibleLength) / AwardsHallConstants.maxAwardsPerCol
      ) * AwardsHallConstants.award.xSpace;

    // Scroll limit is anything that exceed the screen size
    this.scrollLim = this.awardXSpace < screenSize.x ? 0 : this.awardXSpace - screenSize.x;
    this.renderBackground();
    this.renderAwards();

    putWorkerMessage(this, 'A', screenSize.x * 0.95, screenSize.y * 0.99);
  }

  public update() {
    if (!this.backgroundTile || !this.awardsContainer) return;

    // Scroll the awards hall if button is currently clicked/held down
    let newXPos = this.awardsContainer.x;
    if (this.isScrollRight) {
      newXPos -= AwardsHallConstants.scrollSpeed;
    } else if (this.isScrollLeft) {
      newXPos += AwardsHallConstants.scrollSpeed;
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
    this.getLayerManager().addToLayer(Layer.Background, this.backgroundTile);

    // Add banners
    const banners = ['Achievements', 'Collectibles'];
    const bannerPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: banners.length
    });
    banners.forEach((banner, index) => {
      const bannerCont = this.createBanner(banner, bannerPos[index][1]);
      this.getLayerManager().addToLayer(Layer.UI, bannerCont);
    });

    const leftArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onDown: () => (this.isScrollLeft = true),
      onUp: () => (this.isScrollLeft = false),
      onOut: () => (this.isScrollLeft = false)
    }).setPosition(screenCenter.x - AwardsHallConstants.arrow.xOffset, screenCenter.y);

    const rightArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onDown: () => (this.isScrollRight = true),
      onUp: () => (this.isScrollRight = false),
      onOut: () => (this.isScrollRight = false)
    })
      .setPosition(screenCenter.x + AwardsHallConstants.arrow.xOffset, screenCenter.y)
      .setScale(-1, 1);

    const backButton = new CommonBackButton(this, () => {
      this.cleanUp();
      this.scene.start('MainMenu');
    });

    this.getLayerManager().addToLayer(Layer.UI, leftArrow);
    this.getLayerManager().addToLayer(Layer.UI, rightArrow);
    this.getLayerManager().addToLayer(Layer.UI, backButton);
  }

  /**
   * Render all the awards that student has.
   */
  private renderAwards() {
    if (this.awardsContainer) this.awardsContainer.destroy();

    this.awardsContainer = new Phaser.GameObjects.Container(this, 0, 0);

    // Achievement
    const achievements = this.getAwards(this.getUserStateManager().getAchievements());
    const achievementsPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: achievements.length,
      numItemLimit: AwardsHallConstants.maxAwardsPerCol,
      redistributeLast: false,
      maxXSpace: this.awardXSpace,
      maxYSpace: AwardsHallConstants.award.ySpace
    });

    // Achievement is positioned on the upper half of the screen
    this.awardsContainer.add(
      achievements.map((achievement, index) =>
        this.createAward(
          achievement,
          achievementsPos[index][0],
          achievementsPos[index][1] + AwardsHallConstants.award.yStart - screenCenter.y
        )
      )
    );

    // Collectible
    const collectibles = this.getAwards(this.getUserStateManager().getCollectibles());
    const collectiblesPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: collectibles.length,
      numItemLimit: AwardsHallConstants.maxAwardsPerCol,
      redistributeLast: false,
      maxXSpace: this.awardXSpace,
      maxYSpace: AwardsHallConstants.award.ySpace
    });

    // Collectible is positioned on the lower half of the screen
    this.awardsContainer.add(
      collectibles.map((collectible, index) =>
        this.createAward(
          collectible,
          collectiblesPos[index][0],
          collectiblesPos[index][1] + AwardsHallConstants.award.yStart
        )
      )
    );

    this.getLayerManager().addToLayer(Layer.Objects, this.awardsContainer);
  }

  /**
   * Fetch awardProps based on the type string[]
   * @param keys
   */
  private getAwards(keys: string[]) {
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

    let image;
    if (award.assetKey === Constants.nullInteractionId) {
      // No asset is associated with the award
      image = new Phaser.GameObjects.Rectangle(
        this,
        0,
        0,
        AwardsHallConstants.award.dim,
        AwardsHallConstants.award.dim,
        HexColor.darkBlue,
        0.8
      );
      image.setInteractive();

      const text = new Phaser.GameObjects.Text(
        this,
        0,
        0,
        award.title,
        awardNoAssetTitleStyle
      ).setOrigin(0.5, 0.5);
      awardCont.add([image, text]);
    } else {
      image = new Phaser.GameObjects.Sprite(this, 0, 0, award.assetKey).setOrigin(0.5);
      resizeUnderflow(image, AwardsHallConstants.award.dim, AwardsHallConstants.award.dim);
      image.setInteractive({ pixelPerfect: true, useHandCursor: true });

      awardCont.add(image);
    }

    // Add black tint if award is not completed
    const blackTint = new Phaser.GameObjects.Rectangle(
      this,
      0,
      0,
      AwardsHallConstants.award.dim,
      AwardsHallConstants.award.dim,
      0
    ).setAlpha(award.completed ? 0 : 0.8);
    awardCont.add(blackTint);

    // Set up the pop up
    const hoverCont = createAwardsHoverContainer(this, award);
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

    this.getLayerManager().addToLayer(Layer.UI, hoverCont);
    return awardCont;
  }

  /**
   * Clean up of related managers
   */
  private cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
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
      AwardsHallConstants.banner.xOffset,
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

  public getUserStateManager = () => SourceAcademyGame.getInstance().getUserStateManager();
  public getInputManager = () => mandatory(this.inputManager);
  public getLayerManager = () => mandatory(this.layerManager);
}

export default AwardsHall;
