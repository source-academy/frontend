import { Button, Card, Collapse, Elevation } from '@blueprintjs/core';
import { useState } from 'react';

export const noSolutionPlaceholder = (
  <span>
    There is currently no solution available for this exercise. This textbook adaptation is a
    community effort. Do consider contributing by providing a solution for this exercise.
    Instructions on how to contribute can be found at{' '}
    <a href="https://github.com/source-academy/sicp/wiki/Contributing-Exercise-Solutions">
      https://github.com/source-academy/sicp/wiki/Contributing-Exercise-Solutions
    </a>
    .
  </span>
);

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
    <Card className="sicp-exercise" interactive={false} elevation={Elevation.ONE}>
      <b>{props.title}</b>
      <div>{props.body}</div>
      <div className="sicp-button-container">
        <Button onClick={onClick} size="large" className="sicp-show-solution-button">
          {isOpen ? 'Hide Solution' : 'Show Solution'}
        </Button>
      </div>
      <Collapse className="sicp-solution" isOpen={isOpen}>
        {props.solution ? props.solution : noSolutionPlaceholder}
      </Collapse>
    </Card>
  );
}

export default SicpExercise;
