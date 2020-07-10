import { UserState } from './GameStateTypes';
import { emptyUserState, userStateStyle } from './GameStateConstants';
import GameManager from '../scenes/gameManager/GameManager';
import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import GameActionManager from '../action/GameActionManager';
import { createButton } from '../utils/ButtonUtils';
import { screenCenter } from '../commons/CommonConstants';
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
          ImageAssets.longButton.key,
          { x: 0, y: 0, oriX: 0.5, oriY: 0.4 },
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          userStateStyle
        ).setPosition(screenCenter.x, 100)
      );
      assessmentCheckContainer.add(
        ['Yes', 'No'].map((response, index) =>
          createButton(
            gameManager,
            response,
            ImageAssets.shortButton.key,
            { x: 0, y: 0, oriX: 0.5, oriY: 0.4 },
            undefined,
            undefined,
            () => {
              assessmentCheckContainer.destroy();
              resolve(response === 'Yes');
            },
            undefined,
            undefined,
            undefined,
            userStateStyle
          ).setPosition(screenCenter.x, index * 200 + 400)
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
