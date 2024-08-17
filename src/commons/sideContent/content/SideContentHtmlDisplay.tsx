import { IconNames } from '@blueprintjs/icons';
import { bindActionCreators } from '@reduxjs/toolkit';
import React, { useEffect } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { ResultOutput } from 'src/commons/application/ApplicationTypes';

import { beginAlertSideContent } from '../SideContentActions';
import { SideContentLocation, SideContentTab, SideContentType } from '../SideContentTypes';

type OwnProps = {
  content: string;
  handleAddHtmlConsoleError: (errorMsg: string) => void;
  workspaceLocation: SideContentLocation;
};

type DispatchProps = {
  alertSideContent: () => void;
};

const ERROR_MESSAGE_REGEX = /^Line \d+: /i;

const SideContentHtmlDisplayBase: React.FC<OwnProps & DispatchProps> = props => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, props) =>
  bindActionCreators(
    {
      alertSideContent: () =>
        beginAlertSideContent(SideContentType.htmlDisplay, props.workspaceLocation)
    },
    dispatch
  );

export const SideContentHtmlDisplay = connect(null, mapDispatchToProps)(SideContentHtmlDisplayBase);

const makeHtmlDisplayTabFrom = (
  output: ResultOutput,
  handleError: (errorMsg: string) => void,
  workspaceLocation: SideContentLocation
): SideContentTab => ({
  label: 'HTML Display',
  iconName: IconNames.MODAL,
  body: (
    <SideContentHtmlDisplay
      workspaceLocation={workspaceLocation}
      content={output.value}
      handleAddHtmlConsoleError={handleError}
    />
  ),
  id: SideContentType.htmlDisplay
});
export { makeHtmlDisplayTabFrom as default, type OwnProps as SideContentHtmlDisplayProps };
