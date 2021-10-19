import { Button, Card, Classes, Elevation, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { parseError } from 'js-slang';
import { stringify } from 'js-slang/dist/utils/stringify';
import * as React from 'react';

import { Testcase, TestcaseTypes } from '../../assessment/AssessmentTypes';
import SideContentCanvasOutput from './../SideContentCanvasOutput';

type SideContentEditableTestcaseCardProps = DispatchProps & StateProps;

type DispatchProps = {
  setTestcaseProgram: (newProgram: string) => void;
  setTestcaseExpectedResult: (newExpectedResult: string) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  deleteTestcase: (testcaseId: number) => void;
};

type StateProps = {
  index: number;
  testcase: Testcase;
};

const renderResult = (value: any) => {
  /** A class which is the output of the show() function */
  const ShapeDrawn = (window as any).ShapeDrawn;
  if (typeof ShapeDrawn !== 'undefined' && value instanceof ShapeDrawn) {
    return <SideContentCanvasOutput canvas={value.$canvas} />;
  } else {
    return stringify(value);
  }
};

const SideContentEditableTestcaseCard: React.FunctionComponent<SideContentEditableTestcaseCardProps> =
  props => {
    const {
      index,
      testcase,
      setTestcaseProgram,
      setTestcaseExpectedResult,
      handleTestcaseEval,
      deleteTestcase
    } = props;

    // TODO (Refactor): testcase type seems unused in GitHub Assessments
    const extraClasses = React.useMemo(() => {
      const isEvaluated = testcase.result !== undefined || testcase.errors;
      const isEqual = stringify(testcase.result) === testcase.answer;

      return {
        correct: isEvaluated && isEqual,
        wrong: isEvaluated && !isEqual,
        secret: testcase.type === TestcaseTypes.secret || testcase.type === TestcaseTypes.opaque
      };
    }, [testcase]);

    const handleRunTestcase = React.useCallback(() => {
      handleTestcaseEval(index);
    }, [index, handleTestcaseEval]);

    const testProgram = testcase.program;
    const expectedAnswer = testcase.answer;

    const playButton = (
      <Button className="testcase-button" icon={IconNames.PLAY} onClick={handleRunTestcase} />
    );
    const deleteButton = (
      <Button
        className="testcase-button"
        icon={IconNames.DELETE}
        onClick={() => deleteTestcase(index)}
      />
    );

    const answer = React.useMemo(() => {
      let answer = 'No Answer';
      if (testcase.errors) {
        answer = parseError(testcase.errors);
      } else {
        if (testcase.result !== undefined) {
          answer = renderResult(testcase.result) as string;
        }
      }
      return answer;
    }, [testcase]);

    return (
      <div className={classNames('EditableAutograderCard', extraClasses)}>
        <Card className={Classes.INTERACTIVE} elevation={Elevation.ONE}>
          {
            <>
              <InputGroup
                className="testcase-program"
                value={testProgram}
                onChange={(event: any) => setTestcaseProgram(event.target.value)}
              />
              <InputGroup
                className="testcase-expected"
                value={expectedAnswer}
                onChange={(event: any) => setTestcaseExpectedResult(event.target.value)}
              />
              <InputGroup className="testcase-actual" value={answer} readOnly={true} />
            </>
          }
          {playButton}
          {deleteButton}
        </Card>
      </div>
    );
  };

export default SideContentEditableTestcaseCard;
