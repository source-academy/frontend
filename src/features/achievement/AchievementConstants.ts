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

const getAbilityColor = (ability: AchievementAbility) => {
  switch (ability) {
    case AchievementAbility.CORE:
      return '#ffb412'; // gold
    case AchievementAbility.EFFORT:
      return '#b5ff61'; // green
    case AchievementAbility.EXPLORATION:
      return '#9ecaed'; // blue
    case AchievementAbility.COMMUNITY:
      return '#ff6780'; // pink
    case AchievementAbility.FLEX:
      return '#ffffff'; // white
    default:
      return '';
  }
};

export const getAbilityGlow = (ability: AchievementAbility) =>
  ability === AchievementAbility.FLEX
    ? {
        border: `1px solid ${getAbilityColor(ability)}`,
        boxShadow: `
          0 0 5px #fff,     /* outer white */
          -1px 0 10px #f0f, /* outer left magenta */
          1px 0 15px #0ff   /* outer right cyan */`
      }
    : {
        border: `1px solid ${getAbilityColor(ability)}`,
        boxShadow: `0 0 10px ${getAbilityColor(ability)}`
      };

export const achievementAssets = `${Links.sourceAcademyAssets}/achievement`;
export const backgroundUrl = `${achievementAssets}/background`;
export const canvasUrl = `${achievementAssets}/canvas`;
export const cardTileUrl = `${achievementAssets}/card-tile`;

export const getAbilityBackground = (ability: AchievementAbility) => {
  switch (ability) {
    case AchievementAbility.CORE:
      return {
        background: `url(${backgroundUrl}/core-background.png) no-repeat center/cover`
      };
    case AchievementAbility.EFFORT:
      return {
        background: `url(${backgroundUrl}/effort-background.png) no-repeat center/cover`
      };
    case AchievementAbility.EXPLORATION:
      return {
        background: `url(${backgroundUrl}/exploration-background.png) no-repeat center/cover`
      };
    case AchievementAbility.COMMUNITY:
      return {
        background: `url(${backgroundUrl}/community-background.png) no-repeat center/cover`
      };
    case AchievementAbility.FLEX:
      return {
        background: `black`
      };
    default:
      return {};
  }
};
