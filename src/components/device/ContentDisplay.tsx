import { NonIdealState, Spinner } from '@blueprintjs/core'
import * as React from 'react'

export interface IContentDisplayProps {
  displayStream: () => JSX.Element
  contentLoaded?: boolean
  loadContentDispatch: () => void
}

class ContentDisplay extends React.Component<IContentDisplayProps, {}> {
  public componentDidMount() {
    this.props.loadContentDispatch()
  }

  public render() {
    let output
    if (!this.props.contentLoaded) {
      output = <NonIdealState description="Give it a second..." visual={<Spinner />} />
    } else {
      output = this.props.displayStream()
    }

    return (
      <div className="Announcements row center-xs">
        <div className="col-xs-10">{output}</div>
      </div>
    )
  }
}

export default ContentDisplay
