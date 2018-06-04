import * as React from 'react'

export interface IContentDisplayProps {
  displayStream: () => JSX.Element
  loadContentDispatch: () => void
}

class ContentDisplay extends React.Component<IContentDisplayProps, {}> {
  public componentDidMount() {
    this.props.loadContentDispatch()
  }

  public render() {
    return (
      <div className="Announcements row center-xs">
        <div className="col-xs-10">{this.props.displayStream()}</div>
      </div>
    )
  }
}

export default ContentDisplay
