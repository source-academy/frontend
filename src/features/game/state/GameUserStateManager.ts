import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';

import { ItemId } from '../commons/CommonTypes';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';

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
   * Checks whether the given ID exists in the collectible list
   *
   * @param collectibleId - collectible you want to check if present
   */
  public hasCollectible(collectibleId: ItemId): boolean {
    return this.collectibles.has(collectibleId);
  }

  /**
   * Check whether the given assessment ID is complete
   *
   * @param id id of the assessment
   */
  public isAssessmentComplete(id: string): boolean {
    return this.assessments.has(id);
  }

  /**
   * Check whether the given achievement ID is complete
   *
   * @param id id of the achievement
   */
  public isAchievementUnlocked(id: string): boolean {
    return this.achievements.has(id);
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
   * Fetches achievements of the student; based on the account
   * information.
   *
   * Only returns the awards ID that the student possess.
   */
  public async loadAchievements() {
    // TODO: Fetch from backend
    this.achievements = new Set(['301', '302']);
    this.collectibles = new Set(['cookies', 'computer']);
  }

  public getCollectibles = () => Array.from(this.collectibles);
  public getAchievements = () => Array.from(this.achievements);
  public getAssessments = () => Array.from(this.assessments);
}
