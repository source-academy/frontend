import { ItemId } from '../commons/CommonTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import AwardsConstants, { awardKeyStyle, defaultAwardProp } from './GameAwardsConstants';
import { AwardProperty } from './GameAwardsTypes';

/**
 * Get corresponding award properties of the given award keys.
 * Keys that do not have any associated award mapping will be automatically
 * associated with a default award property.
 *
 * @param awardKeys award keys
 */
export const getAwardProps = (awardKeys: ItemId[]): AwardProperty[] => {
  return awardKeys.map(key => getAwardProp(key));
};

/**
 * Get corresponding award property of the given award key.
 * If no property is tied to the given award key, most likely
 * it is because there is no asset is associated with it within the game.
 *
 * In the case there is no property is associated with the key,
 * we return the default award property instead.
 *
 * @param awardKey award key
 */
export const getAwardProp = (awardKey: ItemId): AwardProperty => {
  const awardProp = SourceAcademyGame.getInstance().getAwardsMapping().get(awardKey);
  // TODO: Overwrite some property with existing information where we can
  return awardProp ? awardProp : { ...defaultAwardProp, title: awardKey };
};

export function createAssetKeyPreviewCont(scene: Phaser.Scene, assetKey: string) {
  const assetKeyCont = new Phaser.GameObjects.Container(scene, 0, 0);

  // Create asset key bar and text
  const assetKeyBg = new Phaser.GameObjects.Rectangle(
    scene,
    AwardsConstants.previewKeyRect.x,
    AwardsConstants.previewKeyRect.y,
    AwardsConstants.previewKeyRect.width,
    AwardsConstants.previewKeyRect.height,
    HexColor.lightBlue,
    0.1
  ).setOrigin(0.428, 0.5);
  const assetKeyTagBg = new Phaser.GameObjects.Rectangle(
    scene,
    AwardsConstants.previewKeyRect.x -
      AwardsConstants.previewKeyRect.width * assetKeyBg.originX * 0.75,
    AwardsConstants.previewKeyRect.y,
    AwardsConstants.previewKeyRect.width / 4,
    AwardsConstants.previewKeyRect.height,
    HexColor.lightBlue,
    0.2
  ).setOrigin(assetKeyBg.originX, assetKeyBg.originY);
  const assetKeyTag = createBitmapText(
    scene,
    'asset key',
    AwardsConstants.previewKeyTagTextConfig,
    awardKeyStyle
  );
  const assetKeyText = createBitmapText(
    scene,
    assetKey,
    AwardsConstants.previewKeyTextConfig,
    awardKeyStyle
  );

  // Create explanation pop-up
  // const hoverCont = createExplanationHoverCont(scene);

  // // Attach
  // assetKeyTagBg.setInteractive();
  // assetKeyTagBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
  //   hoverCont.setVisible(true)
  // );
  // assetKeyTagBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
  //   hoverCont.setVisible(false)
  // );

  // assetKeyCont.add([assetKeyBg, assetKeyTagBg, assetKeyTag, assetKeyText, hoverCont]);
  assetKeyCont.add([assetKeyBg, assetKeyTagBg, assetKeyTag, assetKeyText]);
  return assetKeyCont;
}

export function createExplanationHoverCont(scene: Phaser.Scene) {
  const hoverContainer = new Phaser.GameObjects.Container(scene, 0, 0);
  const hoverText = new Phaser.GameObjects.Text(scene, 20, 20, 'award.title', {});
  const hoverBg = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    100,
    hoverText.getBounds().bottom + 20,
    HexColor.darkBlue
  )
    .setOrigin(0.0, 0.0)
    .setAlpha(0.8);
  hoverContainer.add([hoverBg, hoverText]);
  hoverContainer.setVisible(false);
  return hoverContainer;
}
