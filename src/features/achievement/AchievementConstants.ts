import { Links } from '../../commons/utils/Constants';
import { AchievementAbility } from './AchievementTypes';

export const expPerLevel = 1000;

export enum DeadlineColors {
  RED = '#ff0000',
  BLACK = '#000000'
}

export enum FilterColors {
  BLUE = '#2dd1f9',
  WHITE = '#ffffff'
}

export const getAbilityColor = (ability: AchievementAbility) => {
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

export const getAbilityBackground = (ability: AchievementAbility) => {
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
