import { Button } from '@blueprintjs/core'
import * as React from 'react'

class ListVisualizer extends React.Component<{}, {}> {
  private $parent: HTMLElement | null

  public componentDidMount() {
    if (this.$parent) {
      (window as any).ListVisualizer.init(this.$parent)
    }
  }

  public render() {
    return (
      <div ref={r => this.$parent = r} className="sa-list-visualizer pt-dark">
        <div className="row">
          <div className="pt-button-group col-xs-12">
            <Button id="next" onClick={this.handleNext}>Next</Button>
            <Button id="previous" onClick={this.handlePrevious}>Previous</Button>
            <Button id="clear" onClick={this.handleClear}>Clear</Button>
          </div>
        </div>
      </div>
    )
  }

  private handleClear() {
    (window as any).ListVisualizer.clear()
  }

  private handleNext() {
    (window as any).ListVisualizer.next()
  }

  private handlePrevious() {
    (window as any).ListVisualizer.previous()
  }
}

export default ListVisualizer
