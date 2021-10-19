import React from 'react';

import AchievementInferencer from '../../commons/achievement/utils/AchievementInferencer';
import { Links } from '../../commons/utils/Constants';
import { FilterStatus } from './AchievementTypes';

export const AchievementContext = React.createContext(new AchievementInferencer([], []));

export enum DeadlineColors {
  RED = '#f00',
  BLACK = '#000'
}

export enum FilterColors {
  BLUE = '#4df',
  WHITE = '#fff'
}

export const achievementAssets = `${Links.sourceAcademyAssets}achievement`;
export const backgroundUrl = `${achievementAssets}/view-background`;
export const cardBackgroundUrl = `${achievementAssets}/card-background`;
export const coverImageUrl = `${achievementAssets}/cover-image`;

// Keeping these urls in as comments in case future changes want to use them

export const getAbilityBackground = () => {
  return {
    background: `url(${backgroundUrl}/exploration.png) no-repeat center/cover`
  };
  /*
  switch (ability) {
    case AchievementAbility.CORE:
      return {
        background: `url(${backgroundUrl}/core.png) no-repeat center/cover`
      };
    case AchievementAbility.EFFORT:
      return {
        background: `url(${backgroundUrl}/effort.png) no-repeat center/cover`
      };
    case AchievementAbility.EXPLORATION:
      return {
        background: `url(${backgroundUrl}/exploration.png) no-repeat center/cover`
      };
    case AchievementAbility.COMMUNITY:
      return {
        background: `url(${backgroundUrl}/community.png) no-repeat center/cover`
      };
    case AchievementAbility.FLEX:
      return {
        background: `url(${backgroundUrl}/flex.png) no-repeat center/cover`
      };
    default:
      return {
        background: ``
      };
  }
  */
};

export const getAbilityColor = () => {
  return '#9ce'; // blue
  /*
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
  */
};

export const getAbilityGlow = () => ({
  border: `1px solid ${getAbilityColor()}`,
  boxShadow: `0 0 10px ${getAbilityColor()}`
});
/*
  ability === AchievementAbility.FLEX
    ? {
        border: `1px solid ${getAbilityColor(ability)}`,
        boxShadow: `
          0 0 10px #ff0,   
          -1px 0 9px #f0f, 
          1px 0 9px #0ff`
      }
    : {
        border: `1px solid ${getAbilityColor(ability)}`,
        boxShadow: `0 0 10px ${getAbilityColor(ability)}`
      };
  */

export const getFilterColor = (globalStatus: FilterStatus, ownStatus: FilterStatus) =>
  globalStatus === ownStatus ? FilterColors.BLUE : FilterColors.WHITE;

// Make selected achievement + view glow
export const handleGlow = (uuid: string, focusUuid: string) =>
  uuid === focusUuid ? getAbilityGlow() : undefined;

export const xpPerLevel = 1000;
