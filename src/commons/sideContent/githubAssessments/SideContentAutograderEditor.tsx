import { Button, Collapse, Icon, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';
import AceEditor from 'react-ace';

import { Testcase } from '../../assessment/AssessmentTypes';
import controlButton from '../../ControlButton';
import { showSimpleConfirmDialog } from '../../utils/DialogHelper';
import SideContentEditableTestcaseCard from './SideContentEditableTestcaseCard';

export type SideContentAutograderEditorProps = DispatchProps & StateProps;

type DispatchProps = {
  handleTestcaseEval: (testcaseId: number) => void;
  setTaskTestcases: (newTestcases: Testcase[]) => void;
  setTestPrepend: (newTestPrepend: string) => void;
  setTestPostpend: (newTestPostpend: string) => void;
};

type StateProps = {
  testcases: Testcase[];
  testPrepend: string;
  testPostpend: string;
  isTeacherMode: boolean;
};

const SideContentAutograderEditor: React.FunctionComponent<SideContentAutograderEditorProps> =
  props => {
    const [showsTestPrepend, setTestPrependShown] = React.useState<boolean>(true);
    const [showsTestPostpend, setTestPostpendShown] = React.useState<boolean>(true);
    const [showsTestcases, setTestcasesShown] = React.useState<boolean>(true);

    const {
      testcases,
      testPrepend,
      testPostpend,
      isTeacherMode,
      handleTestcaseEval,
      setTaskTestcases,
      setTestPrepend,
      setTestPostpend
    } = props;

    const setTestcaseProgramSetterCreator = React.useCallback(
      (testcaseId: number) => {
        return (newProgram: string) => {
          const newTestcases = testcases.map((testcase: Testcase) => Object.assign({}, testcase));
          newTestcases[testcaseId].program = newProgram;
          delete newTestcases[testcaseId].result;
          setTaskTestcases(newTestcases);
        };
      },
      [setTaskTestcases, testcases]
    );

    const setTestcaseExpectedResultSetterCreator = React.useCallback(
      (testcaseId: number) => {
        return (newExpectedResult: string) => {
          const newTestcases = testcases.map((testcase: Testcase) => Object.assign({}, testcase));
          newTestcases[testcaseId].answer = newExpectedResult;
          delete newTestcases[testcaseId].result;
          setTaskTestcases(newTestcases);
        };
      },
      [setTaskTestcases, testcases]
    );

    const addTestcase = React.useCallback(() => {
      const newTestcases = [...testcases];
      newTestcases.push({
        answer: '',
        program: '',
        score: 0,
        type: 'public'
      });
      setTaskTestcases(newTestcases);
    }, [testcases, setTaskTestcases]);

    const deleteTestcase = React.useCallback(
      async (testcaseId: number) => {
        const confirmDelete = await showSimpleConfirmDialog({
          title: 'confirm testcase deletion',
          contents: 'Are you sure you want to delete this testcase? This cannot be undone.',
          positiveLabel: 'Confirm',
          negativeLabel: 'Cancel'
        });

        if (!confirmDelete) {
          return;
        }

        const newTestcases = testcases.slice(0, testcaseId).concat(testcases.slice(testcaseId + 1));
        setTaskTestcases(newTestcases);
      },
      [testcases, setTaskTestcases]
    );

    const testcaseCards = React.useMemo(
      () =>
        testcases.length > 0 ? (
          <div className="testcaseCards">
            {testcasesHeader}
            {testcases.map((testcase, index) => (
              <SideContentEditableTestcaseCard
                key={index}
                index={index}
                testcase={testcase}
                allowEdits={isTeacherMode}
                setTestcaseProgram={setTestcaseProgramSetterCreator(index)}
                setTestcaseExpectedResult={setTestcaseExpectedResultSetterCreator(index)}
                deleteTestcase={deleteTestcase}
                handleTestcaseEval={handleTestcaseEval}
              />
            ))}
          </div>
        ) : (
          <div className="noResults">There are no testcases provided for this question.</div>
        ),
      [
        isTeacherMode,
        testcases,
        deleteTestcase,
        handleTestcaseEval,
        setTestcaseProgramSetterCreator,
        setTestcaseExpectedResultSetterCreator
      ]
    );

    const createTestCaseButton = React.useMemo(
      () => (
        <Button
          className="collapse-button"
          icon={IconNames.ADD}
          minimal={true}
          text={'Add a new testcase'}
          onClick={addTestcase}
        />
      ),
      [addTestcase]
    );

    const toggleTestPrepend = React.useCallback(() => {
      setTestPrependShown(!showsTestPrepend);
    }, [showsTestPrepend]);

    const toggleTestPostpend = React.useCallback(() => {
      setTestPostpendShown(!showsTestPostpend);
    }, [showsTestPostpend]);

    const toggleTestcases = React.useCallback(() => {
      setTestcasesShown(!showsTestcases);
    }, [showsTestcases]);

    return (
      <div className="Autograder">
        <Button
          className="collapse-button"
          icon={showsTestcases ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
          minimal={true}
          onClick={toggleTestcases}
        >
          <span>Testcases</span>
          <Tooltip2 content={autograderTooltip} placement={PopoverPosition.LEFT}>
            <Icon icon={IconNames.HELP} />
          </Tooltip2>
        </Button>
        <Collapse isOpen={showsTestcases} keepChildrenMounted={true}>
          {testcaseCards}
          {createTestCaseButton}
        </Collapse>

        {isTeacherMode && collapseButton('Testcase Prepend', showsTestPrepend, toggleTestPrepend)}
        {isTeacherMode && (
          <Collapse isOpen={showsTestPrepend} keepChildrenMounted={true}>
            {createEditor(testPrepend, (newValue: string) => setTestPrepend(newValue))}
          </Collapse>
        )}
        {isTeacherMode &&
          collapseButton('Testcase Postpend', showsTestPostpend, toggleTestPostpend)}
        {isTeacherMode && (
          <Collapse isOpen={showsTestPostpend} keepChildrenMounted={true}>
            {createEditor(testPostpend, (newValue: string) => setTestPostpend(newValue))}
          </Collapse>
        )}
      </div>
    );
  };

function createEditor(value: string, onChange: (newValue: string) => void) {
  return (
    <AceEditor
      className="react-ace"
      fontSize={14}
      highlightActiveLine={false}
      mode="javascript"
      onChange={onChange}
      theme="source"
      value={value}
      width="100%"
      height="250px"
    />
  );
}

const autograderTooltip = (
  <div className="autograder-help-tooltip">
    <p>Click on each testcase below to execute it with the program in the editor.</p>
    <p>
      To execute all testcases at once, evaluate the program in the editor with this tab active.
    </p>
    <p>A green or red background indicates a passed or failed testcase respectively.</p>
    <p>Private testcases (only visible to staff when grading) have a grey background.</p>
  </div>
);

const columnHeader = (colClass: string, colTitle: string) => (
  <div className={colClass}>
    {colTitle}
    <Icon icon={IconNames.CARET_DOWN} />
  </div>
);

const testcasesHeader = (
  <div className="testcases-header">
    {columnHeader('header-fn', 'Testcase')}
    {columnHeader('header-expected', 'Expected result')}
    {columnHeader('header-actual', 'Actual result')}
  </div>
);

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) =>
  controlButton(label, isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT, toggleFunc, {
    className: 'collapse-button',
    minimal: true
  });

export default SideContentAutograderEditor;
