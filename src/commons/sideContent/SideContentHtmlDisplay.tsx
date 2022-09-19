import React, { useEffect } from 'react';

export interface SideContentHtmlDisplayProps {
  content: string;
  handleAddHtmlConsoleError: (errorMsg: string) => void;
}

const ERROR_MESSAGE_REGEX = /^Line [\d]+: /i;

const SideContentHtmlDisplay: React.FC<SideContentHtmlDisplayProps> = props => {
  const { content, handleAddHtmlConsoleError } = props;

  useEffect(() => {
    const handleEvent = (event: MessageEvent) => {
      const msg: string = event.data;
      if (msg.match(ERROR_MESSAGE_REGEX)) {
        handleAddHtmlConsoleError(msg);
      }
    };

    window.addEventListener('message', handleEvent);

    return () => window.removeEventListener('message', handleEvent);
  });
  return (
    <iframe
      className="sa-html-display"
      title="HTML Display"
      sandbox="allow-scripts"
      srcDoc={content}
      src="about:blank"
    />
  );
};

export default SideContentHtmlDisplay;
