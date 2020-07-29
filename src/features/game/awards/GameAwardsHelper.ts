import { ItemId } from '../commons/CommonTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { defaultAwardProp } from './GameAwardsConstants';
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
