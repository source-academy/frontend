export type GameAction = {
  actionId: string;
  actionParams: string[];
};

export function createGameAction(actionId: string, actionParams: string[]) {
  return {
    actionId,
    actionParams
  };
}
