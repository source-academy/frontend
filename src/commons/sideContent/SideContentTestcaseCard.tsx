import { Card, Classes, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import { parseError } from 'js-slang';
import { stringify } from 'js-slang/dist/utils/stringify';
import * as React from 'react';

import { Testcase, TestcaseTypes } from '../assessment/AssessmentTypes';
import SideContentCanvasOutput from './SideContentCanvasOutput';

type SideContentTestcaseCardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleTestcaseEval: (testcaseId: number) => void;
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

const SideContentTestcaseCard: React.FunctionComponent<SideContentTestcaseCardProps> = props => {
  const { index, testcase, handleTestcaseEval } = props;

  const extraClasses = React.useMemo(() => {
    const isEvaluated = testcase.result !== undefined || testcase.errors;
    const isEqual = stringify(testcase.result) === testcase.answer;

    return {
      correct: isEvaluated && isEqual,
      wrong: isEvaluated && !isEqual,
      private: testcase.type === TestcaseTypes.private
    };
  }, [testcase]);

  const handleRunTestcase = React.useCallback(() => {
    handleTestcaseEval(index);
  }, [index, handleTestcaseEval]);

  return (
    <div className={classNames('AutograderCard', extraClasses)}>
      <Card className={Classes.INTERACTIVE} elevation={Elevation.ONE} onClick={handleRunTestcase}>
        {testcase.type === TestcaseTypes.hidden ? (
          // Render a placeholder cell in place of the actual testcase data for hidden testcases
          <Pre className="testcase-placeholder">Hidden testcase</Pre>
        ) : (
          <>
            <Pre className="testcase-program">{testcase.program}</Pre>
            <Pre className="testcase-expected">{testcase.answer}</Pre>
            <Pre className="testcase-actual">
              {testcase.errors
                ? parseError(testcase.errors)
                : testcase.result !== undefined
                ? renderResult(testcase.result)
                : 'No Answer'}
            </Pre>
          </>
        )}
      </Card>
    </div>
  );
};

export default SideContentTestcaseCard;
