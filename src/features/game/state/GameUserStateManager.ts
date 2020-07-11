import { UserState } from './GameStateTypes';
import { emptyUserState, userStateStyle } from './GameStateConstants';
import GameManager from '../scenes/gameManager/GameManager';
import { getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
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
    if (listName === 'assessments' && GameGlobalAPI.getInstance().isStorySimulator()) {
      return this.askAssessmentComplete(id);
    }
    return this.userState[listName].includes(id);
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
    if (GameGlobalAPI.getInstance().isStorySimulator()) {
      return;
    }
    const assessments = await getAssessmentOverviews(getSourceAcademyGame().getAccountInfo());
    this.userState.assessments = assessments
      ?.filter(assessment => assessment.status === 'submitted')
      .map(assessment => assessment.id.toString());
  }
}
