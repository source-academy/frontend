import { Collapse, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { AutogradingResult, Testcase } from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';
import AutograderCard from './AutograderCard';
import ResultCard from './ResultCard';

export type AutograderProps = DispatchProps & StateProps;

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

class Autograder extends React.Component<AutograderProps, State> {
  public constructor(props: AutograderProps) {
    super(props);

    this.state = {
      showTestcases: true,
      showResults: true
    };
  }

  public render() {
    const testcasesHeader = (
      <div className="testcases-header" key={-1}>
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
      <div className="results-header" key={-1}>
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
        [testcasesHeader].concat(
          this.props.testcases.map((testcase, index) => (
            <AutograderCard
              key={index}
              index={index}
              testcase={testcase}
              handleTestcaseEval={this.props.handleTestcaseEval}
            />
          ))
        )
      ) : (
        <div className="noResults">There are no testcases provided for this mission.</div>
      );

    const results =
      this.props.autogradingResults.length > 0 ? (
        [resultsHeader].concat(
          this.props.autogradingResults.map((result, index) => (
            <ResultCard key={index} index={index} result={result} />
          ))
        )
      ) : (
        <div className="noResults">There are no results to show.</div>
      );

    const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) =>
      controlButton(label, isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT, toggleFunc, {
        minimal: true,
        className: 'collapse-button'
      });

    return (
      <div className="Autograder">
        {collapseButton('Testcases', this.state.showTestcases, this.toggleTestcases)}
        <Collapse isOpen={this.state.showTestcases}>{testcases}</Collapse>
        {collapseButton('Autograder Results', this.state.showResults, this.toggleResults)}
        <Collapse isOpen={this.state.showResults}>{results}</Collapse>
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

export default Autograder;
