import { Card, Elevation } from '@blueprintjs/core';
import { useEffect } from 'react';

export type ContentDisplayProps = {
  fullWidth?: boolean;
  display: React.ReactElement;
  loadContentDispatch?: () => void;
};

function ContentDisplay(props: ContentDisplayProps) {
  useEffect(() => {
    props.loadContentDispatch?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ContentDisplay row center-xs">
      <div
        className={`${
          props.fullWidth ? 'col-md-12' : 'col-md-10 col-xs-11'
        } contentdisplay-content-parent`}
      >
        <Card className="contentdisplay-content" elevation={Elevation.THREE}>
          {props.display}
        </Card>
      </div>
    </div>
  );
}

export default ContentDisplay;
