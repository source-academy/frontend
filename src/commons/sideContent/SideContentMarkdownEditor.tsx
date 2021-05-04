import React, { useEffect } from 'react';

import Markdown from '../Markdown';

export type SideContentMarkdownEditorProps = {
  content: string;
  setContent: (content: string) => void;
};

export const SideContentMarkdownEditor: React.FC<SideContentMarkdownEditorProps> = props => {
  const [editorModeOn, setEditorModeOn] = React.useState(false);

  const node = React.useRef() as any;

  useEffect(() => {
    function handleClick(event: any) {
      if (node.current && !node.current.contains(event.target)) {
        setEditorModeOn(false);
      }

      if (node.current && node.current.contains(event.target)) {
        setEditorModeOn(true);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return (
    <div ref={node}>
      {editorModeOn ? (
        <textarea onChange={onEditorChange}>{props.content}</textarea>
      ) : (
        <Markdown content={props.content} openLinksInNewWindow={true} />
      )}
    </div>
  );

  function onEditorChange(event: any) {
    props.setContent(event.target.value);
  }
};
