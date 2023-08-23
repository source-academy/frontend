import React, { useEffect } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

import { addAlertSideContentToProps, AlertSideContentDispatchProps } from '../SideContentHelper';
import { SideContentType } from '../SideContentTypes';

type OwnProps = {
  content: string;
  workspaceLocation: WorkspaceLocation;
  handleAddHtmlConsoleError: (errorMsg: string) => void;
};

type DispatchProps = AlertSideContentDispatchProps;

const ERROR_MESSAGE_REGEX = /^Line \d+: /i;

const SideContentHtmlDisplay: React.FC<OwnProps & DispatchProps> = props => {
  const { content, handleAddHtmlConsoleError, alertSideContent } = props;

  useEffect(() => {
    const handleEvent = (event: MessageEvent) => {
      const msg = event.data;
      // Only displays message if it matches the error message format,
      // since there may be other message events not sent by iframe
      if (typeof msg === 'string' && msg.match(ERROR_MESSAGE_REGEX)) {
        handleAddHtmlConsoleError(msg);
      }
    };

    window.addEventListener('message', handleEvent);

    return () => window.removeEventListener('message', handleEvent);
  });

  useEffect(() => {
    alertSideContent();
  }, []);

  return (
    <iframe
      className="sa-html-display"
      title="HTML Display"
      sandbox="allow-scripts"
      srcDoc={JSON.parse(content)}
      src="about:blank"
    />
  );
};

const mapDispatchToProps: MapDispatchToProps<AlertSideContentDispatchProps, OwnProps> = (
  dispatch,
  { workspaceLocation }
) => addAlertSideContentToProps(dispatch, {}, SideContentType.htmlDisplay, workspaceLocation);
export default connect(null, mapDispatchToProps)(SideContentHtmlDisplay);
