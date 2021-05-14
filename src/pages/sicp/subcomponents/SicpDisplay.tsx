import { Card } from '@blueprintjs/core';
import * as React from 'react';
import { useState } from 'react';
import { parseJson } from 'src/features/sicp/parser/ParseJson';

type SicpDisplayProps = OwnProps;
type OwnProps = {
    content: any;
};

const SicpDisplay: React.FC<SicpDisplayProps> = props => {
  const { content } = props;

  const [state, setState] = useState(1);

  const handleClick = () => {
    setState(state + 1);
    console.log("snippet clicked");
  }

  return (
    <>
    <div style={{position: "fixed", backgroundColor: "beige"}}>
      Current State: {state}
    </div>
    <Card className="sicp-display-card">
      {parseJson(content, handleClick)}
    </Card>
    </>
  );
};

export default SicpDisplay;
