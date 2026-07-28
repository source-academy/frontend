import { Button, Card, Collapse, Elevation } from '@blueprintjs/core';
import { useState } from 'react';

import NoSolutionPlaceholder from './NoSolutionPlaceholder';

type Props = {
  title: string;
  body: React.ReactElement;
  solution: React.ReactElement | undefined;
};

function SicpExercise(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card className="sicp-exercise text-inherit" interactive={false} elevation={Elevation.ONE}>
      <b>{props.title}</b>
      <div>{props.body}</div>
      <div className="sicp-button-container">
        <Button onClick={onClick} size="large" className="sicp-show-solution-button">
          {isOpen ? 'Hide Solution' : 'Show Solution'}
        </Button>
      </div>
      <Collapse className="sicp-solution" isOpen={isOpen}>
        {props.solution ?? <NoSolutionPlaceholder />}
      </Collapse>
    </Card>
  );
}

export default SicpExercise;
