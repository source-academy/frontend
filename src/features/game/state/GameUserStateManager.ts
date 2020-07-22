import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';

import ImageAssets from '../assets/ImageAssets';
import { screenCenter } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { userStateStyle } from './GameStateConstants';

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
  public async isAssessmentComplete(id: string): Promise<boolean> {
    return SourceAcademyGame.getInstance().isGameType(GameType.Simulator)
      ? await this.askAssessmentComplete(id)
      : this.assessments.has(id);
  }

  /**
   * Check whether the given achievement ID is complete
   *
   * @param id id of the achievement
   */
  public async isAchievementUnlocked(id: string): Promise<boolean> {
    return this.achievements.has(id);
  }

  /**
   * Display a UI that asks whether an assessment has been completed based
   * on the assessment ID.
   *
   * This is to allow Story Simulator to test/by pass assessment requirement
   * within a particular checkpoint.
   *
   * @param assessmentId assessment ID
   */
  public async askAssessmentComplete(assessmentId: string): Promise<boolean> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const assessmentCheckContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, assessmentCheckContainer);

    const activateAssessmentContainer: Promise<boolean> = new Promise(resolve => {
      assessmentCheckContainer.add(
        createButton(gameManager, {
          assetKey: ImageAssets.longButton.key,
          message: `Assessment#${assessmentId} completed?`,
          textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.4 },
          bitMapTextStyle: userStateStyle
        }).setPosition(screenCenter.x, 100)
      );
      assessmentCheckContainer.add(
        ['Yes', 'No'].map((response, index) =>
          createButton(gameManager, {
            assetKey: ImageAssets.shortButton.key,
            message: response,
            textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.4 },
            bitMapTextStyle: userStateStyle,
            onUp: () => {
              assessmentCheckContainer.destroy();
              resolve(response === 'Yes');
            }
          }).setPosition(screenCenter.x, index * 200 + 400)
        )
      );
    });
    const response = await activateAssessmentContainer;
    return response;
  }

  /**
   * Fetches assessment overview of the student; based on
   * the account information.
   *
   * Only returns submitted assessments' ids.
   */
  public async loadAssessments() {
    if (SourceAcademyGame.getInstance().isGameType(GameType.Simulator)) {
      return;
    }
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
