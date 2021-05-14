import { Card } from '@blueprintjs/core';
import * as React from 'react';
import { useState } from 'react';

import SicpWorkspace from './SicpWorkspace';

type CodeSnippetProps = OwnProps;
type OwnProps = {
  body: string;
  output: string;
};

const CodeSnippet: React.FC<CodeSnippetProps> = props => {
  const { body, output } = props;

  const [open, setOpen] = useState(false);

  const onClick = () => {
    setOpen(!open);
  };

  const WorkspaceProps = {
    editorValue: body,

    handleCloseEditor: onClick,
  }

  return (
    <div>
      {open ? (
        <SicpWorkspace {...WorkspaceProps}/>
      ) : (
        <>
          <Card className="sicp-code-snippet" onClick={onClick}>
            {body}
          </Card>
          {output ? <Card className="sicp-code-result">{output}</Card> : <></>}
        </>
      )}
    </div>
  );
};

export default CodeSnippet;
