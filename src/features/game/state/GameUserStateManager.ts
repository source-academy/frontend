import { mockGoals } from 'src/commons/mocks/AchievementMocks';
import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';
import { AchievementGoal } from 'src/features/achievement/AchievementTypes';

import { getAwardProp } from '../awards/GameAwardsHelper';
import { AwardProperty } from '../awards/GameAwardsTypes';
import { Constants } from '../commons/CommonConstants';
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
   * the account information.
   *
   * Only returns submitted assessments' ids.
   */
  public async loadAssessments() {
    const assessments = await getAssessmentOverviews(
      SourceAcademyGame.getInstance().getAccountInfo()
    );
    this.assessments = new Set(
      (assessments || [])
        .filter(assessment => assessment.status === 'submitted')
        .map(assessment => assessment.id.toString())
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
    const achievements = SourceAcademyGame.getInstance().getAchievements();
    // TODO: replace below with const goals = SourceAcademyGame.getInstance().getGoals();
    const goals = new Map<number, AchievementGoal>();
    // TODO: replace mockGoals with the goals from redux store
    mockGoals.forEach(goal => goals.set(goal.id, goal));

    achievements.forEach(achievement => {
      const achievementId = achievement.id.toString();
      const isCompleted = achievement.goalIds.reduce(
        (result, goalId) => result && goals.get(goalId)!.completed,
        true
      );
      const awardProp = getAwardProp(achievementId);

      let newAwardProp: AwardProperty;
      if (!awardProp) {
        // If there is no mapping, we create one from available information
        newAwardProp = {
          id: achievementId,
          assetKey: Constants.nullInteractionId,
          assetPath: Constants.nullInteractionId,
          title: achievement.title,
          description: achievement.view.description,
          completed: isCompleted
        };
      } else {
        // If there is mapping, we update the complete attribute
        newAwardProp = { ...awardProp, completed: isCompleted };
      }
      SourceAcademyGame.getInstance().addAwardMapping(achievementId, newAwardProp);
      this.achievements.add(achievementId);
    });
  }

  public getCollectibles = () => Array.from(this.collectibles);
  public getAchievements = () => Array.from(this.achievements);
  public getAssessments = () => Array.from(this.assessments);
}
