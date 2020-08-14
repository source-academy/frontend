import { Button, Collapse, Icon, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { AutogradingResult, Testcase } from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';
import SideContentAutograderCard from './SideContentAutograderCard';
import SideContentResultCard from './SideContentResultCard';

export type SideContentAutograderProps = DispatchProps & StateProps;

type DispatchProps = {
  handleTestcaseEval: (testcaseId: number) => void;
};

type StateProps = {
  autogradingResults: AutogradingResult[];
  testcases: Testcase[];
};

type State = {
  showTestcases: boolean;
  showResults: boolean;
};

class SideContentAutograder extends React.Component<SideContentAutograderProps, State> {
  public constructor(props: SideContentAutograderProps) {
    super(props);

    this.state = {
      showTestcases: true,
      showResults: true
    };
  }

  public render() {
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

    const resultsHeader = (
      <div className="results-header">
        <div className="header-data">
          {columnHeader('header-sn', 'S/N')}
          {columnHeader('header-status', 'Testcase status')}
        </div>
        {columnHeader('header-expected', 'Expected result')}
        {columnHeader('header-actual', 'Actual result')}
      </div>
    );

    const testcases =
      this.props.testcases.length > 0 ? (
        <div>
          {testcasesHeader}
          {this.props.testcases.map((testcase, index) => (
            <SideContentAutograderCard
              key={index}
              index={index}
              testcase={testcase}
              handleTestcaseEval={this.props.handleTestcaseEval}
            />
          ))}
        </div>
      ) : (
        <div className="noResults">There are no testcases provided for this question.</div>
      );

    const results =
      this.props.autogradingResults.length > 0 ? (
        <div>
          {resultsHeader}
          {this.props.autogradingResults.map((result, index) => (
            <SideContentResultCard key={index} index={index} result={result} />
          ))}
        </div>
      ) : (
        <div className="noResults">There are no results to show.</div>
      );

    const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) =>
      controlButton(label, isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT, toggleFunc, {
        className: 'collapse-button',
        minimal: true
      });

    return (
      <div className="Autograder">
        <Button
          className="collapse-button"
          icon={this.state.showTestcases ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
          minimal={true}
          onClick={this.toggleTestcases}
        >
          <span>Testcases</span>
          <Tooltip content={autograderTooltip} position={PopoverPosition.LEFT} boundary={'window'}>
            <Icon icon={IconNames.HELP} />
          </Tooltip>
        </Button>
        <Collapse isOpen={this.state.showTestcases} keepChildrenMounted={true}>
          {testcases}
        </Collapse>
        {collapseButton('Autograder Results', this.state.showResults, this.toggleResults)}
        <Collapse isOpen={this.state.showResults} keepChildrenMounted={true}>
          {results}
        </Collapse>
      </div>
    );
  }

  private toggleTestcases = () => this.setState({ showTestcases: !this.state.showTestcases });

  private toggleResults = () => this.setState({ showResults: !this.state.showResults });
}

export default SideContentAutograder;
