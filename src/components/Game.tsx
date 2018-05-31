import * as React from 'react'

import story from '../story/index'

export class Game extends React.Component<{}, {}> {
  public componentDidMount() {
    story()
  }

  public render() {
    return (
      <div
        id="game-display"
        className="sa-game"
        data-story="spaceship"
        data-attempted-all="true"
        data-username="mockUsername"
      />
    )
  }
}

export default Game
