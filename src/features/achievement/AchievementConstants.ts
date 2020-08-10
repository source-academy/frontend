import React from 'react';

import AchievementInferencer from '../../commons/achievement/utils/AchievementInferencer';
import { defaultAchievement } from '../../commons/application/ApplicationTypes';
import { Links } from '../../commons/utils/Constants';
import { AchievementAbility, FilterStatus } from './AchievementTypes';

export const expPerLevel = 1000;

const { achievements: defaultAchievements, goals: defaultGoals } = defaultAchievement;
export const AchievementContext = React.createContext(
  new AchievementInferencer(defaultAchievements, defaultGoals)
);

export enum DeadlineColors {
  RED = '#f00',
  BLACK = '#000'
}

export enum FilterColors {
  BLUE = '#4df',
  WHITE = '#fff'
}

export const getFilterColor = (globalStatus: FilterStatus, ownStatus: FilterStatus) =>
  globalStatus === ownStatus ? FilterColors.BLUE : FilterColors.WHITE;

export const getAbilityColor = (ability: AchievementAbility) => {
  switch (ability) {
    case AchievementAbility.CORE:
      return '#fb0'; // gold
    case AchievementAbility.EFFORT:
      return '#bf6'; // green
    case AchievementAbility.EXPLORATION:
      return '#9ce'; // blue
    case AchievementAbility.COMMUNITY:
      return '#f68'; // pink
    case AchievementAbility.FLEX:
      return '#fff'; // white
    default:
      return '';
  }
};

export const getAbilityGlow = (ability: AchievementAbility) =>
  ability === AchievementAbility.FLEX
    ? {
        border: `1px solid ${getAbilityColor(ability)}`,
        boxShadow: `
          0 0 10px #ff0,   /* yellow */
          -1px 0 9px #f0f, /* magenta */
          1px 0 9px #0ff   /* cyan */`
      }
    : {
        border: `1px solid ${getAbilityColor(ability)}`,
        boxShadow: `0 0 10px ${getAbilityColor(ability)}`
      };

// Make selected achievements + view and Flex achievements glow
export const handleGlow = (id: number, focusId: number, ability: AchievementAbility) =>
  ability === AchievementAbility.FLEX || id === focusId ? getAbilityGlow(ability) : undefined;

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
        background: `url(${backgroundUrl}/flex-background.png) no-repeat center/cover`
      };
    default:
      return {
        background: ``
      };
  }
};
