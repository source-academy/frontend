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

export default class GameUserStateManager {
  private userState: UserState;

  constructor() {
    this.userState = {};
  }

  public initialise() {
    this.userState.collectibles = SourceAcademyGame.getInstance()
      .getSaveManager()
      .getFullSaveState().userSaveState.collectibles;
  }

  public addToList(listName: UserStateTypes, id: string): void {
    if (!this.userState[listName]) this.userState[listName] = [];

    this.userState[listName]!.push(id);
  }

  public getList(listName: UserStateTypes): string[] {
    if (!this.userState[listName]) this.userState[listName] = [];

    return this.userState[listName]!;
  }

  public async doesIdExistInList(listName: string, id: string): Promise<boolean> {
    if (
      listName === 'assessments' &&
      SourceAcademyGame.getInstance().isGameType(GameType.Simulator)
    ) {
      return this.askAssessmentComplete(id);
    }
    return this.getUserState()[listName].includes(id);
  }

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

  public async loadAchievements() {
    // TODO: Fetch from backend
    this.userState.achievements = ['301', '302'];
    this.userState.collectibles = ['cookies', 'computer'];
  }

  public getUserState = () => mandatory(this.userState);
}
