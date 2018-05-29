import * as React from 'react'

import * as Pixi from 'pixi.js'

import * as Story from '../story/index'

export class Game extends React.Component<{}, {}> {
  private app: Pixi.Application
  private gameCanvas: HTMLDivElement

  /**
   * After mounting, add the Pixi Renderer to the div and start the Application.
   */
  public componentDidMount() {
    const story = Story as any
    story()
    this.app = new Pixi.Application(window.innerWidth, window.innerHeight) // TODO change this
    this.gameCanvas.appendChild(this.app.view)
    this.app.start()
  }

  public componentWillMount() {
    // (window as any).test();
  }

  /**
   * Stop the Application when unmounting.
   */
  // public componentWillUnmount() {
  //   this.app.stop();
  // }

  /**
   * Simply render the div that will contain the Pixi Renderer.
   */
  public render() {
    return (
      <div
        id="game-display"
        ref={thisDiv => {
          this.gameCanvas = thisDiv as HTMLDivElement
        }}
        className="sa-game"
        data-story="spaceship"
        data-attempted-all="true"
        data-username="mockUsername"
      />
    )
  }

  // public render() {
  //   return (
  //     <div className="Game">
  //       <div id="game-display"
  //         className="sa-game"
  //         data-story="<%= @story_override || @story %>"
  //         data-attempted-all="<%= @attempted_all %>"
  //         data-username="<%= @username %>" />
  //     </div>
  //   )
  // }
}

export default Game
