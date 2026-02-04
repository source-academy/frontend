import { Button, Collapse, Icon, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('sideContent', { keyPrefix: 'autograder' });
  const [showsTestcases, setTestcasesShown] = useState(true);
  const [showsResults, setResultsShown] = useState(true);

  const { testcases, autogradingResults, handleTestcaseEval, workspaceLocation } = props;

  const autograderTooltip = useMemo(
    () => (
      <div className="autograder-help-tooltip">
        <p>{t('tooltip.clickTestcase')}</p>
        <p>{t('tooltip.executeAll')}</p>
        <p>{t('tooltip.backgroundInfo')}</p>
        <p>{t('tooltip.privateTestcases')}</p>
      </div>
    ),
    [t]
  );

  const testcasesHeader = useMemo(
    () => (
      <div className="testcases-header" data-testid="testcases-header">
        {columnHeader('header-fn', t('headers.testcase'))}
        {columnHeader('header-expected', t('headers.expected'))}
        {columnHeader('header-actual', t('headers.actual'))}
      </div>
    ),
    [t]
  );

  const resultsHeader = useMemo(
    () => (
      <div className="results-header" data-testid="results-header">
        <div className="header-data">
          {columnHeader('header-sn', t('headers.sn'))}
          {columnHeader('header-status', t('headers.status'))}
        </div>
        {columnHeader('header-expected', t('headers.expected'))}
        {columnHeader('header-actual', t('headers.actual'))}
      </div>
    ),
    [t]
  );

  const testcaseCards = useMemo(
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
          {t('noTestcases')}
        </div>
      ),
    [testcases, testcasesHeader, t, handleTestcaseEval, workspaceLocation]
  );

  const resultCards = useMemo(
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
          {t('noResults')}
        </div>
      ),
    [autogradingResults, resultsHeader, t]
  );

  const toggleTestcases = useCallback(() => {
    setTestcasesShown(!showsTestcases);
  }, [showsTestcases]);

  const toggleResults = useCallback(() => setResultsShown(!showsResults), [showsResults]);

  return (
    <div className="Autograder">
      <Button
        className="collapse-button"
        icon={showsTestcases ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
        minimal={true}
        onClick={toggleTestcases}
      >
        <span>{t('testcases')}</span>
        <Tooltip content={autograderTooltip} placement={PopoverPosition.LEFT}>
          <Icon icon={IconNames.HELP} />
        </Tooltip>
      </Button>
      <Collapse isOpen={showsTestcases} keepChildrenMounted={true}>
        {testcaseCards}
      </Collapse>
      {collapseButton(t('results'), showsResults, toggleResults)}
      <Collapse isOpen={showsResults} keepChildrenMounted={true}>
        {resultCards}
      </Collapse>
    </div>
  );
};

const columnHeader = (colClass: string, colTitle: string) => (
  <div className={colClass}>
    {colTitle}
    <Icon icon={IconNames.CARET_DOWN} />
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
