import { Card } from '@blueprintjs/core'
import * as React from 'react'

export interface IContentDisplayProps {
  display: JSX.Element
  loadContentDispatch: () => void
}

class ContentDisplay extends React.Component<IContentDisplayProps, {}> {
  public componentDidMount() {
    this.props.loadContentDispatch()
  }

  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div className="col-xs-10 contentdisplay-content-parent">
          <Card className="contentdisplay-content" elevation={1}>
            {this.props.display}
          </Card>
        </div>
      </div>
    )
  }
}

export default ContentDisplay
