import * as React from 'react'

import story from './game.js'

export class Game extends React.Component<{}, {}> {
  private ref: HTMLDivElement

  public componentDidMount() {
    story(this.ref)
  }

  public render() {
    return (
      <div
        id="game-display"
        className="sa-game"
        data-story="spaceship"
        data-attempted-all="true"
        data-username="mockUsername"
        ref={e => (this.ref = e as HTMLDivElement)}
      />
    )
  }
}

export default Game
