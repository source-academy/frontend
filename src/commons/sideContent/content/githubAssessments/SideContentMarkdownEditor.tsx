import { TextArea } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';

import Markdown from '../../../Markdown';

type Props = {
  allowEdits: boolean;
  content: string;
  setContent: (content: string) => void;
};

const SideContentMarkdownEditor: React.FC<Props> = ({ allowEdits, content, setContent }) => {
  const [editorModeOn, setEditorModeOn] = useState(false);

  const node = useRef<HTMLDivElement>(null);

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
        <TextArea onChange={onEditorChange} fill autoResize defaultValue={content} />
      ) : (
        <Markdown content={content} openLinksInNewWindow />
      )}
    </div>
  );

  function onEditorChange(event: any) {
    setContent(event.target.value);
  }
};

export default SideContentMarkdownEditor;
