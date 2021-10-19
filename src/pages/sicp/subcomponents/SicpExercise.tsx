import { Button, Card, Collapse, Elevation } from '@blueprintjs/core';
import * as React from 'react';

type SicpExerciseProps = OwnProps;
type OwnProps = {
  title: string;
  body: JSX.Element;
  solution: JSX.Element | undefined;
};

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

const SicpExercise: React.FC<SicpExerciseProps> = props => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card className="sicp-exercise" interactive={false} elevation={Elevation.ONE}>
      <b>{props.title}</b>
      <div>{props.body}</div>
      <div className="sicp-button-container">
        <Button onClick={onClick} large={true} className="sicp-show-solution-button">
          {isOpen ? 'Hide Solution' : 'Show Solution'}
        </Button>
      </div>
      <Collapse className="sicp-solution" isOpen={isOpen}>
        {props.solution ? props.solution : noSolutionPlaceholder}
      </Collapse>
    </Card>
  );
};

export default SicpExercise;
