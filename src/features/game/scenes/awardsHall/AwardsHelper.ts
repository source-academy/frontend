import { AwardProperty } from '../../awards/GameAwardsTypes';
import { HexColor } from '../../utils/StyleUtils';
import { AwardsHallConstants } from './AwardsHallConstants';

export const createAwardsHoverContainer = (scene: Phaser.Scene, award: AwardProperty) => {
  const hoverContainer = new Phaser.GameObjects.Container(scene, 0, 0);
  const hoverTextBg = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    AwardsHallConstants.hoverWidth,
    AwardsHallConstants.hoverHeight,
    HexColor.darkBlue
  )
    .setOrigin(0.0, 0.5)
    .setAlpha(0.8);

  const awardTitle = new Phaser.GameObjects.Text(scene, 10, 10, award.title, {});
  const awardAssetKey = new Phaser.GameObjects.Text(scene, 10, 10, award.assetKey, {});
  const awardDesc = new Phaser.GameObjects.Text(scene, 0, 0, award.description, {});

  hoverContainer.add([hoverTextBg, awardTitle, awardAssetKey, awardDesc]);
  hoverContainer.setVisible(false);
  return hoverContainer;
};
