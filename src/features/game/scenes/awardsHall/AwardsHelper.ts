import { AwardProperty } from '../../awards/GameAwardsTypes';
import { HexColor } from '../../utils/StyleUtils';
import {
  awardHoverDescStyle,
  awardHoverKeyStyle,
  awardHoverTitleStyle,
  AwardsHallConstants
} from './AwardsHallConstants';

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
    AwardsHallConstants.hoverWidth,
    awardDesc.getBounds().bottom + 20,
    HexColor.darkBlue
  )
    .setOrigin(0.0, 0.0)
    .setAlpha(0.8);

  hoverContainer.add([hoverTextBg, awardTitle, awardAssetKey, awardDesc]);
  hoverContainer.setVisible(false);
  return hoverContainer;
};
