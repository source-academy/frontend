import { Card, Elevation } from '@blueprintjs/core';
import * as React from 'react';

export type ContentDisplayProps = {
  fullWidth?: boolean;
  display: JSX.Element;
  loadContentDispatch: () => void;
};

class ContentDisplay extends React.Component<ContentDisplayProps, {}> {
  public componentDidMount() {
    this.props.loadContentDispatch();
  }

  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div
          className={`col-xs-11 ${
            this.props.fullWidth ? 'col-md-12' : 'col-md-10'
          } contentdisplay-content-parent`}
        >
          <Card className="contentdisplay-content" elevation={Elevation.THREE}>
            {this.props.display}
          </Card>
        </div>
      </div>
    );
  }
}

export default ContentDisplay;
