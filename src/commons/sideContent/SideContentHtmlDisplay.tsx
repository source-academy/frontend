import React, { useEffect } from 'react';

export interface SideContentHtmlDisplayProps {
  content: string;
  handleAddHtmlConsoleError: (errorMsg: string) => void;
}

const SideContentHtmlDisplay: React.FC<SideContentHtmlDisplayProps> = props => {
  const { content, handleAddHtmlConsoleError } = props;

  useEffect(() => {
    const handleEvent = (event: any) => {
      handleAddHtmlConsoleError(event.message || event.data);
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
