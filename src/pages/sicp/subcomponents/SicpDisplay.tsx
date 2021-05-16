import { Card } from '@blueprintjs/core';
import * as React from 'react';
import { parseJson } from 'src/features/sicp/parser/ParseJson';

type SicpDisplayProps = OwnProps;
type OwnProps = {
    content: any;
};

const SicpDisplay: React.FC<SicpDisplayProps> = props => {
  const { content } = props;

  return (
    <>
    <Card className="sicp-display-card">
      {parseJson(content)}
    </Card>
    </>
  );
};

export default SicpDisplay;
