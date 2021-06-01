import { Button, Card, Classes, Elevation, InputGroup, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { parseError } from 'js-slang';
import { stringify } from 'js-slang/dist/utils/stringify';
import * as React from 'react';

import { Testcase, TestcaseTypes } from '../assessment/AssessmentTypes';
import SideContentCanvasOutput from './SideContentCanvasOutput';

type SideContentEditableTestcaseCardProps = DispatchProps & StateProps;

type DispatchProps = {
  setTestcaseProgram: (newProgram: string) => void;
  setTestcaseExpectedResult: (newExpectedResult: string) => void;
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

const SideContentEditableTestcaseCard: React.FunctionComponent<SideContentEditableTestcaseCardProps> =
  props => {
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

    const testProgram = testcase.program;
    const expectedAnswer = testcase.answer;

    const playButton = <Button icon={IconNames.PLAY} onClick={handleRunTestcase} />;

    return (
      <div className={classNames('AutograderCard', extraClasses)}>
        <Card className={Classes.INTERACTIVE} elevation={Elevation.ONE}>
          {testcase.type === TestcaseTypes.hidden ? (
            // Render a placeholder cell in place of the actual testcase data for hidden testcases
            <Pre className="testcase-placeholder">Hidden testcase</Pre>
          ) : (
            <>
              <EditableField
                className="testcase-program"
                fieldValue={testProgram}
                allowEdits={true}
                testcaseId={props.index}
                setContent={props.setTestcaseProgram}
              />
              <EditableField
                className="testcase-expected"
                fieldValue={expectedAnswer}
                allowEdits={true}
                testcaseId={props.index}
                setContent={props.setTestcaseExpectedResult}
              />
              <Pre className="testcase-actual">
                {testcase.errors
                  ? parseError(testcase.errors)
                  : testcase.result !== undefined
                  ? renderResult(testcase.result)
                  : 'No Answer'}
              </Pre>
            </>
          )}
          {playButton}
        </Card>
      </div>
    );

    /*
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
    */
  };

type EditableFieldProps = {
  className: string;
  fieldValue: string;
  allowEdits: boolean;
  testcaseId: number;
  setContent: (newContent: string) => void;
};

const EditableField: React.FC<EditableFieldProps> = props => {
  const allowEdits = props.allowEdits;

  const [editorModeOn, setEditorModeOn] = React.useState(false);

  const node = React.useRef() as any;
  React.useEffect(() => {
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

  function onEditorChange(event: any) {
    props.setContent(event.target.value);
  }

  if (editorModeOn) {
    return <Pre className={props.className}>{props.fieldValue}</Pre>;
  } else {
    return <InputGroup value={props.fieldValue} onChange={onEditorChange} />;
  }
};

export default SideContentEditableTestcaseCard;
