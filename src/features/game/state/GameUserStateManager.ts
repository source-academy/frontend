import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';

import ImageAssets from '../assets/ImageAssets';
import { screenCenter } from '../commons/CommonConstants';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { mandatory } from '../utils/GameUtils';
import { userStateStyle } from './GameStateConstants';
import { UserState, UserStateTypes } from './GameStateTypes';

/**
 * Manages all states related to user, but not related to the
 * particular story or chapter; e.g. collectibles, achievements, and assessments.
 */
export default class GameUserStateManager {
  private userState: UserState;

  constructor() {
    this.userState = {};
  }

  public initialise() {
    this.userState.collectibles = SourceAcademyGame.getInstance()
      .getSaveManager()
      .getLoadedUserState().collectibles;
  }

  /**
   * Add an id to one of the user state list.
   *
   * @param listName name of list to be added
   * @param id id of item
   */
  public addToList(listName: UserStateTypes, id: string): void {
    if (!this.userState[listName]) this.userState[listName] = [];

    this.userState[listName]!.push(id);
  }

  /**
   * Return a user state list.
   *
   * @param listName name of list
   */
  public getList(listName: UserStateTypes): string[] {
    if (!this.userState[listName]) this.userState[listName] = [];

    return this.userState[listName]!;
  }

  /**
   * Check whether the given ID exist within one of the user state list.
   *
   * @param listName list to be queried
   * @param id id of the item
   */
  public async doesIdExistInList(listName: UserStateTypes, id: string): Promise<boolean> {
    if (
      listName === UserStateTypes.assessments &&
      SourceAcademyGame.getInstance().isGameType(GameType.Simulator)
    ) {
      return this.askAssessmentComplete(id);
    }
    return this.getUserState()[listName as string].includes(id);
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
    this.userState.assessments = assessments
      ?.filter(assessment => assessment.status === 'submitted')
      .map(assessment => assessment.id.toString());
  }

  /**
   * Fetches achievements of the student; based on the account
   * information.
   *
   * Only returns the awards ID that the student possess.
   */
  public async loadAchievements() {
    // TODO: Fetch from backend
    this.userState.achievements = ['301', '302'];
    this.userState.collectibles = ['cookies', 'computer'];
  }

  public getUserState = () => mandatory(this.userState);
}
