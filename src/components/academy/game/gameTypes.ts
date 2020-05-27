import { GameState, Story } from 'src/reducers/states';

export type GameData = {
  story: Story | undefined;
  gameStates: GameState;
  currentDate: string;
};
