import { UserState } from './GameStateTypes';
import { emptyUserState, userStateStyle } from './GameStateConstants';
import GameManager from '../scenes/gameManager/GameManager';
import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import GameActionManager from '../action/GameActionManager';
import { createButton } from '../utils/StyleUtils';
import { screenCenter, Constants } from '../commons/CommonConstants';
import { Layer } from '../layer/GameLayerTypes';
import ImageAssets from '../assets/ImageAssets';

export default class GameUserStateManager {
  private userState: UserState;

  constructor() {
    this.userState = emptyUserState;
  }

  public initialise(gameManager: GameManager) {
    this.userState = gameManager.saveManager.getLoadedUserState() || emptyUserState;
  }

  public addToList(listName: string, id: string): void {
    this.userState[listName].push(id);
  }

  public getList(listName: string): string[] {
    return this.userState[listName];
  }

  public async doesIdExistInList(listName: string, id: string): Promise<boolean> {
    if (listName === 'assessments' && GameActionManager.getInstance().isStorySimulator()) {
      return this.askAssessmentComplete(id);
    }
    return this.userState[listName].includes(id);
  }

  public async askAssessmentComplete(assessmentId: string): Promise<boolean> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const assessmentCheckContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    GameActionManager.getInstance().addContainerToLayer(Layer.UI, assessmentCheckContainer);

    const activateAssessmentContainer: Promise<boolean> = new Promise(resolve => {
      assessmentCheckContainer.add(
        createButton(
          gameManager,
          `Assessment#${assessmentId} completed?`,
          Constants.nullFunction,
          ImageAssets.longButton.key,
          { x: screenCenter.x, y: 100 },
          0.5,
          0.4,
          userStateStyle
        )
      );
      assessmentCheckContainer.add(
        ['Yes', 'No'].map((response, index) =>
          createButton(
            gameManager,
            response,
            () => {
              assessmentCheckContainer.destroy();
              resolve(response === 'Yes');
            },
            ImageAssets.shortButton.key,
            { x: screenCenter.x, y: index * 200 + 400 },
            0.5,
            0.4,
            userStateStyle
          )
        )
      );
    });
    const response = await activateAssessmentContainer;
    return response;
  }

  public async loadAssessments() {
    if (GameActionManager.getInstance().isStorySimulator()) {
      return;
    }
    const assessments = await getAssessmentOverviews(getSourceAcademyGame().getAccountInfo());
    this.userState.assessments = assessments
      ?.filter(assessment => assessment.status === 'submitted')
      .map(assessment => assessment.id.toString());
  }
}
