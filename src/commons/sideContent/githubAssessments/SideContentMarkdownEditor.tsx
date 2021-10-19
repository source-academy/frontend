import { TextArea } from '@blueprintjs/core';
import React, { useEffect } from 'react';

import Markdown from '../../Markdown';

export type SideContentMarkdownEditorProps = {
  allowEdits: boolean;
  content: string;
  setContent: (content: string) => void;
};

const SideContentMarkdownEditor: React.FC<SideContentMarkdownEditorProps> = props => {
  const [editorModeOn, setEditorModeOn] = React.useState(false);
  const allowEdits = props.allowEdits;

  const node = React.useRef() as any;

  useEffect(() => {
    function handleClick(event: any) {
      if (!allowEdits) {
        return;
      }

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
  }, [allowEdits]);

  return (
    <div ref={node}>
      {editorModeOn ? (
        <TextArea
          onChange={onEditorChange}
          fill={true}
          growVertically={true}
          defaultValue={props.content}
        />
      ) : (
        <Markdown content={props.content} openLinksInNewWindow={true} />
      )}
    </div>
  );

  function onEditorChange(event: any) {
    props.setContent(event.target.value);
  }
};

export default SideContentMarkdownEditor;
