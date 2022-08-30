import React from 'react';

export interface SideContentHtmlDisplayProps {
  content: string;
}

const SideContentHtmlDisplay: React.FC<SideContentHtmlDisplayProps> = props => {
  const { content } = props;

  return (
    <iframe
      className="sa-html-display"
      title="HTML Display"
      sandbox="allow-scripts"
      srcDoc={content}
    />
  );
};

export default SideContentHtmlDisplay;
