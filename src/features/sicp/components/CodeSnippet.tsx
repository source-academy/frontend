import { Card } from '@blueprintjs/core';
import * as React from 'react';
import { useState } from 'react';

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

  return (
    <div onClick={onClick}>
      {open ? (
        <div>open</div>
      ) : (
        <>
          <Card className="sicp-code-snippet">{body}</Card>
          {output ? <Card className="sicp-code-result">{output}</Card> : <></>}
        </>
      )}
    </div>
  );
};

export default CodeSnippet;
