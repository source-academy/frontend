import * as React from 'react'

import * as Pixi from 'pixi.js'

export class Game extends React.Component<{}, {}> {
  private app: Pixi.Application
  private gameCanvas: HTMLDivElement

  /**
   * After mounting, add the Pixi Renderer to the div and start the Application.
   */
  public componentDidMount() {
    this.app = new Pixi.Application(window.innerWidth, window.innerHeight) // TODO change this
    this.gameCanvas.appendChild(this.app.view)
    this.app.start()
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
        ref={thisDiv => {
          this.gameCanvas = thisDiv as HTMLDivElement
        }}
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
