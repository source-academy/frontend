import { GameActionType, GameAction } from './GameActionTypes';
import GameActionManager from './GameActionManager';

export default class GameActionExecuter {
  public async executeSafeActions(actions: GameAction[]) {
    for (const action of actions) {
      await this.executeSafeAction(action);
    }
  }

  private async executeSafeAction(action: GameAction) {
    const { actionType, actionParams } = action;

    switch (actionType) {
      case GameActionType.Collectible:
        GameActionManager.getInstance().obtainCollectible(actionParams.id);
        return;
    }
  }
}
