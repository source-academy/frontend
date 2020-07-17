import SourceAcademyGame from 'src/pages/academy/game/subcomponents/SourceAcademyGame';

import { ItemId } from '../commons/CommonTypes';
import { mandatory } from '../utils/GameUtils';
import { AwardProperty } from './GameAwardsTypes';

export const getAwardProps = (awardKeys: ItemId[]): AwardProperty[] => {
  return awardKeys.map(key => getAwardProp(key));
};
export const getAwardProp = (awardKey: ItemId): AwardProperty => {
  const awardProp = SourceAcademyGame.getInstance().getAwardsMapping().get(awardKey);
  return mandatory(awardProp);
};
