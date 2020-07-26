import { ItemId } from '../commons/CommonTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { mandatory } from '../utils/GameUtils';
import { AwardProperty } from './GameAwardsTypes';

/**
 * Get corresponding award properties of the given award keys
 * @param awardKeys award keys
 */
export const getAwardProps = (awardKeys: ItemId[]): AwardProperty[] => {
  return awardKeys.map(key => getAwardProp(key));
};

/**
 * Get corresponding award property of the given award key
 * @param awardKey award key
 */
export const getAwardProp = (awardKey: ItemId): AwardProperty => {
  const awardProp = SourceAcademyGame.getInstance().getAwardsMapping().get(awardKey);
  return mandatory(awardProp);
};
