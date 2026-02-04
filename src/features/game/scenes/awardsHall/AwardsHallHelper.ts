import ImageAssets from '../../assets/ImageAssets';
import { AwardProperty } from '../../awards/GameAwardsTypes';
import { HexColor } from '../../utils/StyleUtils';
import {
  awardHoverDescStyle,
  awardHoverKeyStyle,
  awardHoverTitleStyle,
  AwardsHallConstants
} from './AwardsHallConstants';

/**
 * Create a pop up text that appear when user hover over an award.
 * The hover container will display information based on the award property;
 * e.g. its title, its asset-key, as well as its description.
 *
 * @param scene scene for the hover to attach to
 * @param award awardProperty to be used
 * @returns {Phaser.GameObjects.Container}
 */
export const createAwardsHoverContainer = (scene: Phaser.Scene, award: AwardProperty) => {
  const hoverContainer = new Phaser.GameObjects.Container(scene, 0, 0);

  const awardTitle = new Phaser.GameObjects.Text(scene, 20, 20, award.title, awardHoverTitleStyle);
  const awardAssetKey = new Phaser.GameObjects.Text(
    scene,
    20,
    awardTitle.getBounds().bottom + 20,
    award.assetKey,
    awardHoverKeyStyle
  );
  const awardDesc = new Phaser.GameObjects.Text(
    scene,
    20,
    awardAssetKey.getBounds().bottom + 20,
    award.description,
    awardHoverDescStyle
  );

  const hoverTextBg = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    AwardsHallConstants.awardInfo.width,
    awardDesc.getBounds().bottom + 20,
    HexColor.darkBlue
  )
    .setOrigin(0.0, 0.0)
    .setAlpha(0.8);

  const scrollFrameTop = new Phaser.GameObjects.Sprite(
    scene,
    AwardsHallConstants.awardInfo.width / 2,
    0,
    ImageAssets.scrollFrame.key
  );
  const scrollFrameBot = new Phaser.GameObjects.Sprite(
    scene,
    AwardsHallConstants.awardInfo.width / 2,
    hoverTextBg.getBounds().bottom,
    ImageAssets.scrollFrame.key
  );

  hoverContainer.add([hoverTextBg, awardTitle, awardDesc, scrollFrameTop, scrollFrameBot]);

  // Only show asset key if award is completed
  if (award.completed) {
    hoverContainer.add(awardAssetKey);
  }

  hoverContainer.setVisible(false);
  return hoverContainer;
};
