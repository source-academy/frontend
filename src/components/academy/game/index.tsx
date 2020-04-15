import * as React from 'react';
import { GameState, Role, Story } from '../../../reducers/states';
import { setSaveHandler } from './backend/game-state';
import { setUserRole } from './backend/user';

type GameProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleSaveCanvas: (c: HTMLCanvasElement) => void;
  handleSaveData: (s: GameState) => void;
};

export type StateProps = {
  canvas?: HTMLCanvasElement;
  name: string;
  story: Story;
  gameState: GameState;
  role?: Role;
};

export class Game extends React.Component<GameProps, {}> {
  private canvas: HTMLCanvasElement;
  private div: HTMLDivElement;

  /**
   * Basically, if the function story is called twice (on different canvas
   * elements), the second time the component is mounted, the pixi.js canvas
   * will show nothing but a black screen. This means that if the user
   * navigate aways from the game tab, and then back again, the game would not
   * work.
   *
   * So, we save a reference to the first canvas that is loaded. Thereafter,
   * when this component is mounted, use that canvas instead of the new canvas
   * mounted with this div. This is a bit hacky, and refs aren't favoured in
   * react, but it also prevents excessive loading of the game
   *
   * Note that the story/4's 4th param is named 'attemptedAll'. It is true if a
   * storyline should not be loaded, and false if it should. In contrast,
   * backend sends us 'playStory', which is the negation (!) of `attemptedAll`.
   */
  public async componentDidMount() {
    const story: any = (await import('./game.js')).default;
    if (this.props.canvas === undefined) {
      setUserRole(this.props.role);
      setSaveHandler((gameState: GameState) => this.props.handleSaveData(gameState));

      story(this.div, this.canvas, this.props.name, this.props.story, this.props.gameState);
      this.props.handleSaveCanvas(this.canvas);
    } else {
      // This browser window has loaded the Game component & canvas before
      this.div.innerHTML = '';
      this.div.appendChild(this.props.canvas);
    }
  }

  public render() {
    return (
      <div id="game-display" className="sa-game" ref={e => (this.div = e!)}>
        <canvas ref={e => (this.canvas = e!)} />
      </div>
    );
  }
}

export default Game;
