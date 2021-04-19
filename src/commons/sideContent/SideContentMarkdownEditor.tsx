import React from 'react';

import Markdown from '../Markdown';

export type SideContentMarkdownEditorProps = {
  content: string
};

export const SideContentMarkdownEditor: React.FC<SideContentMarkdownEditorProps> = props => {
  return (
    <div>
      <Markdown content={props.content} openLinksInNewWindow={true} />
    </div>
  );
};
