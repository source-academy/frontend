import { Button, Collapse, Icon, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';
import AceEditor from 'react-ace';

import { Testcase } from '../../assessment/AssessmentTypes';
import controlButton from '../../ControlButton';
import { showSimpleConfirmDialog } from '../../utils/DialogHelper';
import SideContentTestcaseCard from '../SideContentTestcaseCard';
import SideContentEditableTestcaseCard from './SideContentEditableTestcaseCard';

export type SideContentTestcaseEditorProps = DispatchProps & StateProps;

type DispatchProps = {
  handleTestcaseEval: (testcaseId: number) => void;
  setTaskTestcases: (newTestcases: Testcase[]) => void;
  setTestPrepend: (newTestPrepend: string) => void;
  setTestPostpend: (newTestPostpend: string) => void;
};

type StateProps = {
  allowEdits: boolean;
  testcases: Testcase[];
  testPrepend: string;
  testPostpend: string;
};

const SideContentTestcaseEditor: React.FunctionComponent<SideContentTestcaseEditorProps> =
  props => {
    const [showsTestPrepend, setTestPrependShown] = React.useState<boolean>(true);
    const [showsTestPostpend, setTestPostpendShown] = React.useState<boolean>(true);
    const [showsTestcases, setTestcasesShown] = React.useState<boolean>(true);

    const {
      testcases,
      testPrepend,
      testPostpend,
      allowEdits,
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

    const convertToTestcaseCard = React.useCallback(
      (testcase, index) => {
        if (allowEdits) {
          return (
            <SideContentEditableTestcaseCard
              key={index}
              index={index}
              testcase={testcase}
              setTestcaseProgram={setTestcaseProgramSetterCreator(index)}
              setTestcaseExpectedResult={setTestcaseExpectedResultSetterCreator(index)}
              deleteTestcase={deleteTestcase}
              handleTestcaseEval={handleTestcaseEval}
            />
          );
        } else {
          return (
            <SideContentTestcaseCard
              key={index}
              index={index}
              testcase={testcase}
              handleTestcaseEval={handleTestcaseEval}
              workspaceLocation="githubAssessment"
            />
          );
        }
      },
      [
        allowEdits,
        deleteTestcase,
        handleTestcaseEval,
        setTestcaseProgramSetterCreator,
        setTestcaseExpectedResultSetterCreator
      ]
    );

    const testcaseCards = React.useMemo(
      () =>
        testcases.length > 0 ? (
          <div className="testcaseCards">
            {testcasesHeader}
            {testcases.map((testcase, index) => convertToTestcaseCard(testcase, index))}
          </div>
        ) : (
          <div className="noResults">There are no testcases provided for this question.</div>
        ),
      [testcases, convertToTestcaseCard]
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
          <div className="testcaseeditor-subcomponent">
            {testcaseCards}
            {allowEdits && createTestCaseButton}
          </div>
        </Collapse>

        {allowEdits && collapseButton('Testcase Prepend', showsTestPrepend, toggleTestPrepend)}
        {allowEdits && (
          <Collapse isOpen={showsTestPrepend} keepChildrenMounted={true}>
            <div className="testcaseeditor-subcomponent">
              {createEditor(testPrepend, (newValue: string) => setTestPrepend(newValue))}
            </div>
          </Collapse>
        )}

        {allowEdits && collapseButton('Testcase Postpend', showsTestPostpend, toggleTestPostpend)}
        {allowEdits && (
          <Collapse isOpen={showsTestPostpend} keepChildrenMounted={true}>
            <div className="testcaseeditor-subcomponent">
              {createEditor(testPostpend, (newValue: string) => setTestPostpend(newValue))}
            </div>
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
      height="16rem"
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

export default SideContentTestcaseEditor;
