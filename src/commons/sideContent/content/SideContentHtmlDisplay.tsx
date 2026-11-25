import { IconNames } from '@blueprintjs/icons';
import { useEffect } from 'react';
import type { ResultOutput } from 'src/commons/application/ApplicationTypes';
import { useAppDispatch } from 'src/commons/utils/Hooks';

import { alertSideContent } from '../SideContentActions';
import {
  type SideContentLocation,
  type SideContentTab,
  SideContentType,
} from '../SideContentTypes';

type Props = {
  content: string;
  handleAddHtmlConsoleError: (errorMsg: string) => void;
  workspaceLocation: SideContentLocation;
};

const ERROR_MESSAGE_REGEX = /^Line \d+: /i;

export function SideContentHtmlDisplay(props: Props) {
  const { content, handleAddHtmlConsoleError, workspaceLocation } = props;
  const dispatch = useAppDispatch();

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
    dispatch(alertSideContent(SideContentType.htmlDisplay, workspaceLocation));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <iframe
      className="sa-html-display"
      title={'HTML Display'}
      sandbox="allow-scripts"
      srcDoc={content}
      src="about:blank"
    />
  );
}

const makeHtmlDisplayTabFrom = (
  output: ResultOutput,
  handleError: (errorMsg: string) => void,
  workspaceLocation: SideContentLocation,
): SideContentTab => ({
  label: 'HTML Display',
  iconName: IconNames.MODAL,
  body: (
    <SideContentHtmlDisplay
      workspaceLocation={workspaceLocation}
      content={String(output.value)}
      handleAddHtmlConsoleError={handleError}
    />
  ),
  id: SideContentType.htmlDisplay,
});

export default makeHtmlDisplayTabFrom;
