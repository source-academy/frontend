import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';
import { AchievementGoal } from 'src/features/achievement/AchievementTypes';

import { ItemId } from '../commons/CommonTypes';
import { promptWithChoices } from '../effects/Prompt';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';
import StringUtils from '../utils/StringUtils';
import { UserStateType } from './GameStateTypes';

/**
 * Manages all states related to user, but not related to the
 * particular story or chapter; e.g. collectibles, achievements, and assessments.
 */
export default class GameUserStateManager {
  private collectibles: Set<string>;
  private achievements: Set<string>;
  private assessments: Set<string>;

  constructor() {
    this.collectibles = new Set([]);
    this.achievements = new Set([]);
    this.assessments = new Set([]);
  }

  public async loadUserState() {
    if (SourceAcademyGame.getInstance().isGameType(GameType.Simulator)) return;
    await this.loadAchievements();
    await this.loadAssessments();
    this.collectibles = new Set(
      SourceAcademyGame.getInstance().getSaveManager().getLoadedUserState().collectibles
    );
  }

  /**
   * Adds the given id to the collectible list
   *
   * @param collectibleId - collectible you want to check if present
   */
  public addCollectible(collectibleId: ItemId) {
    this.collectibles.add(collectibleId);
  }

  /**
   * Fetches assessment overview of the student; based on
   * the account information. Only include submitted assessments' ids.
   *
   * IMPT: The assessments are ordered from earliest close date.
   */
  public async loadAssessments() {
    const assessments = await getAssessmentOverviews(
      SourceAcademyGame.getInstance().getAccountInfo()
    );
    this.assessments = new Set(
      (assessments || [])
        .filter(assessment => assessment.status === 'submitted')
        .sort((a, b) => (a.closeAt <= b.closeAt ? -1 : 1))
        .map(assessment => assessment.number || assessment.id.toString())
    );
  }

  /**
   * This function checks for the existence of a certain
   * item ID inside one of the user state lists
   *
   * @param userStateType which of the user states you want to check
   * @param id the item ID of the state you want to check
   * @returns {Promise<boolean>} true if item ID is found in the user state list
   */
  public async isInUserState(userStateType: UserStateType, id: ItemId): Promise<boolean> {
    if (SourceAcademyGame.getInstance().isGameType(GameType.Game)) {
      return this[userStateType].has(id);
    } else {
      const response = await promptWithChoices(
        GameGlobalAPI.getInstance().getGameManager(),
        `${StringUtils.capitalize(userStateType)} ${id}?`,
        ['Yes', 'No']
      );
      return response === 0;
    }
  }

  /**
   * Fetches achievements of the student;
   */
  public async loadAchievements() {
    const awardsMapping = SourceAcademyGame.getInstance().getAwardsMapping();
    const achievements = SourceAcademyGame.getInstance().getAchievements();
    const goals = SourceAcademyGame.getInstance().getGoals();

    // Convert goals to map
    const goalMapping = new Map<string, AchievementGoal>();
    goals.forEach(goal => goalMapping.set(goal.uuid, goal));

    achievements.forEach(achievement => {
      const achievementUuid = achievement.uuid.toString();
      const isCompleted = achievement.goalUuids.reduce(
        (result, goalUuid) => result && !!goalMapping.get(goalUuid)?.completed,
        true
      );
      const awardProp = awardsMapping.get(achievementUuid);

      if (awardProp) {
        // If there is mapping, we update the complete attribute
        const newAwardProp = { ...awardProp, completed: isCompleted };
        SourceAcademyGame.getInstance().addAwardMapping(newAwardProp.assetKey, newAwardProp);
        this.achievements.add(newAwardProp.assetKey);
      }
    });
  }

  public getCollectibles = () => Array.from(this.collectibles);
  public getAchievements = () => Array.from(this.achievements);
  public getAssessments = () => Array.from(this.assessments);
}
