import { Collapse, Icon } from '@blueprintjs/core';
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
    const testcasesHeader = (
      <div className="testcases-header">
        <div className="header-fn">
          <Icon icon={IconNames.CARET_DOWN} />
          Testcase (click to run)
        </div>
        <div className="header-expected">
          <Icon icon={IconNames.CARET_DOWN} />
          Expected result
        </div>
        <div className="header-actual">
          <Icon icon={IconNames.CARET_DOWN} />
          Actual result
        </div>
      </div>
    );

    const resultsHeader = (
      <div className="results-header">
        <div className="header-data">
          <div className="header-sn">
            <Icon icon={IconNames.CARET_DOWN} />
            S/N
          </div>
          <div className="header-status">
            <Icon icon={IconNames.CARET_DOWN} />
            Testcase status
          </div>
        </div>
        <div className="header-expected">
          <Icon icon={IconNames.CARET_DOWN} />
          Expected result
        </div>
        <div className="header-actual">
          <Icon icon={IconNames.CARET_DOWN} />
          Actual result
        </div>
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
        iconOnRight: true,
        minimal: true
      });

    return (
      <div className="Autograder">
        {collapseButton('Testcases', this.state.showTestcases, this.toggleTestcases)}
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

  private toggleTestcases = () =>
    this.setState({
      ...this.state,
      showTestcases: !this.state.showTestcases
    });

  private toggleResults = () =>
    this.setState({
      ...this.state,
      showResults: !this.state.showResults
    });
}

export default SideContentAutograder;
