import { GameState, Story } from 'src/reducers/states';

export type GameSessionData = {
  story: Story | undefined;
  gameStates: GameState;
  currentDate: string;
};
