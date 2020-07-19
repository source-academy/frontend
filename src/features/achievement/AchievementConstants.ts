import { Links } from '../../commons/utils/Constants';
import { AchievementAbility } from './AchievementTypes';

export const expPerLevel = 1000;

export const abilityColor = (ability: AchievementAbility) => {
  switch (ability) {
    case AchievementAbility.CORE:
      return '#ffb412';
    case AchievementAbility.EFFORT:
      return '#b5ff61';
    case AchievementAbility.EXPLORATION:
      return '#9ecaed';
    case AchievementAbility.COMMUNITY:
      return '#ff6780';
    case AchievementAbility.FLEX:
      return '#ffffff';
    default:
      return '#ffffff';
  }
};

export const achievementAssets = `${Links.sourceAcademyAssets}/achievement`;
export const backgroundUrl = `${achievementAssets}/background`;
export const canvasUrl = `${achievementAssets}/canvas`;
export const cardTileUrl = `${achievementAssets}/card-tile`;

export const abilityBackground = (ability: AchievementAbility) => {
  switch (ability) {
    case AchievementAbility.CORE:
      return {
        background: `url(${backgroundUrl}/core-background.png) no-repeat center`
      };
    case AchievementAbility.EFFORT:
      return {
        background: `url(${backgroundUrl}/effort-background.png) no-repeat center`
      };
    case AchievementAbility.EXPLORATION:
      return {
        background: `url(${backgroundUrl}/exploration-background.png) no-repeat center`
      };
    case AchievementAbility.COMMUNITY:
      return {
        background: `url(${backgroundUrl}/community-background.png) no-repeat center`
      };
    case AchievementAbility.FLEX:
      return {
        background: `black`
      };
    default:
      return {
        background: 'black'
      };
  }
};
