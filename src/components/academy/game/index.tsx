import * as React from 'react'

import story from './game.js'

interface IGameProps {
  canvas?: HTMLCanvasElement
  handleSaveCanvas: (c: HTMLCanvasElement) => void
}

export type DispatchProps = Pick<IGameProps, 'handleSaveCanvas'>

export type StateProps = Pick<IGameProps, 'canvas'>

export class Game extends React.Component<IGameProps, {}> {
  private canvas: HTMLCanvasElement
  private div: HTMLDivElement

  public componentDidMount() {
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
     */
    if (this.props.canvas === undefined) {
      story(this.div, this.canvas, 'mission-1')
      this.props.handleSaveCanvas(this.canvas)
    } else {
      this.div.innerHTML = ''
      this.div.appendChild(this.props.canvas)
    }
  }

  public render() {
    return (
      <div
        id="game-display"
        className="sa-game"
        data-story="spaceship"
        data-attempted-all="true"
        data-username="mockUsername"
        ref={e => (this.div = e!)}
      >
        <canvas ref={e => (this.canvas = e!)} />
      </div>
    )
  }
}

export default Game
