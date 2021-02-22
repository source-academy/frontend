import CommonTextHover from '../commons/CommonTextHover';
import { ItemId } from '../commons/CommonTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import AwardsConstants, {
  awardExplanation,
  awardKeyStyle,
  defaultAwardProp
} from './GameAwardsConstants';
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
  return awardProp ? awardProp : { ...defaultAwardProp, title: awardKey };
};

/**
 * Create a UI bar, labeled as 'asset key' on the side. To be used
 * within Awards Menu UI container. On hover on the label,
 * will pop up a hover text explanation on the use of the asset key.
 *
 * @param scene scene to attach to
 */
export function createAssetKeyPreviewCont(scene: Phaser.Scene) {
  const assetKeyCont = new Phaser.GameObjects.Container(
    scene,
    AwardsConstants.preview.rect.xOffset,
    AwardsConstants.preview.rect.yOffset
  );
  const rectDim = AwardsConstants.preview.key;

  // Create asset key bar and text
  const assetKeyBg = new Phaser.GameObjects.Rectangle(
    scene,
    rectDim.x,
    rectDim.y,
    rectDim.width,
    rectDim.height,
    HexColor.lightBlue,
    0.1
  );
  const assetKeyTagBg = new Phaser.GameObjects.Rectangle(
    scene,
    rectDim.x - rectDim.width * assetKeyBg.originX * 0.75,
    rectDim.y,
    rectDim.width / 4,
    rectDim.height,
    HexColor.lightBlue,
    0.2
  );
  const assetKeyTag = createBitmapText(
    scene,
    'asset key',
    AwardsConstants.preview.keyTagTextConfig,
    awardKeyStyle
  );

  // Create explanation pop-up
  const hoverCont = new CommonTextHover(
    scene,
    AwardsConstants.preview.explanation.x,
    AwardsConstants.preview.explanation.y,
    awardExplanation
  );

  // Attach
  assetKeyTagBg.setInteractive();
  assetKeyTagBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
    hoverCont.setVisible(true)
  );
  assetKeyTagBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
    hoverCont.setVisible(false)
  );

  assetKeyCont.add([assetKeyBg, assetKeyTagBg, assetKeyTag, hoverCont]);
  return assetKeyCont;
}
