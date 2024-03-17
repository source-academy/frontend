import { Button, Collapse, Icon, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { AutogradingResult, Testcase } from '../../assessment/AssessmentTypes';
import ControlButton from '../../ControlButton';
import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import SideContentResultCard from './SideContentResultCard';
import SideContentTestcaseCard from './SideContentTestcaseCard';

export type SideContentAutograderProps = DispatchProps & StateProps & OwnProps;

type DispatchProps = {
  handleTestcaseEval: (testcaseId: number) => void;
};

type StateProps = {
  autogradingResults: AutogradingResult[];
  testcases: Testcase[];
};

type OwnProps = {
  /**
   * We need to know the workspace location to hide 'opaque' testcases
   * in AssessmentsWorkspace, but show them in GradingWorkspace.
   */
  workspaceLocation: WorkspaceLocation;
};

const SideContentAutograder: React.FC<SideContentAutograderProps> = props => {
  const [showsTestcases, setTestcasesShown] = React.useState(true);
  const [showsResults, setResultsShown] = React.useState(true);

  const { testcases, autogradingResults, handleTestcaseEval, workspaceLocation } = props;

  const testcaseCards = React.useMemo(
    () =>
      testcases.length > 0 ? (
        <div className="testcaseCards">
          {testcasesHeader}
          {testcases.map((testcase, index) => (
            <SideContentTestcaseCard
              key={index}
              index={index}
              testcase={testcase}
              handleTestcaseEval={handleTestcaseEval}
              workspaceLocation={workspaceLocation}
            />
          ))}
        </div>
      ) : (
        <div className="noResults" data-testid="noResults">
          There are no testcases provided for this question.
        </div>
      ),
    [testcases, handleTestcaseEval, workspaceLocation]
  );

  const resultCards = React.useMemo(
    () =>
      autogradingResults.length > 0 ? (
        <div>
          {resultsHeader}
          {autogradingResults.map((result, index) => (
            <SideContentResultCard key={index} index={index} result={result} />
          ))}
        </div>
      ) : (
        <div className="noResults" data-testid="noResults">
          There are no results to show.
        </div>
      ),
    [autogradingResults]
  );

  const toggleTestcases = React.useCallback(() => {
    setTestcasesShown(!showsTestcases);
  }, [showsTestcases]);

  const toggleResults = React.useCallback(() => setResultsShown(!showsResults), [showsResults]);

  return (
    <div className="Autograder">
      <Button
        className="collapse-button"
        icon={showsTestcases ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
        minimal={true}
        onClick={toggleTestcases}
      >
        <span>Testcases</span>
        <Tooltip content={autograderTooltip} placement={PopoverPosition.LEFT}>
          <Icon icon={IconNames.HELP} />
        </Tooltip>
      </Button>
      <Collapse isOpen={showsTestcases} keepChildrenMounted={true}>
        {testcaseCards}
      </Collapse>
      {collapseButton('Autograder Results', showsResults, toggleResults)}
      <Collapse isOpen={showsResults} keepChildrenMounted={true}>
        {resultCards}
      </Collapse>
    </div>
  );
};

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
  <div className="testcases-header" data-testid="testcases-header">
    {columnHeader('header-fn', 'Testcase')}
    {columnHeader('header-expected', 'Expected result')}
    {columnHeader('header-actual', 'Actual result')}
  </div>
);

const resultsHeader = (
  <div className="results-header" data-testid="results-header">
    <div className="header-data">
      {columnHeader('header-sn', 'S/N')}
      {columnHeader('header-status', 'Testcase status')}
    </div>
    {columnHeader('header-expected', 'Expected result')}
    {columnHeader('header-actual', 'Actual result')}
  </div>
);

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) => (
  <ControlButton
    label={label}
    icon={isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
    onClick={toggleFunc}
    options={{ className: 'collapse-button', minimal: true }}
  />
);

export default SideContentAutograder;
