import { Collapse } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { AutogradingResult, ITestcase } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import AutograderCard from './AutograderCard';
import ResultCard from './ResultCard';

type AutograderProps = {
  autogradingResults: AutogradingResult[];
  testcases: ITestcase[] | null;
  handleTestcaseEval: (testcaseId: number) => void;
};

type State = {
  showTestcases: boolean;
  showResults: boolean;
};

class Autograder extends React.Component<AutograderProps, State> {
  public constructor(props: AutograderProps) {
    super(props);

    const hasResults: boolean = this.props.autogradingResults.length > 0 ? true : false;

    this.state = {
      showTestcases: !hasResults,
      showResults: hasResults
    };
  }

  public render() {
    const testcases =
      this.props.testcases && this.props.testcases.length > 0 ? (
        this.props.testcases.map((testcase, index) => (
          <AutograderCard
            key={index}
            index={index}
            testcase={testcase}
            handleTestcaseEval={this.props.handleTestcaseEval}
          />
        ))
      ) : (
        <div className="noResults">There are no testcases provided for this mission.</div>
      );

    const results =
      this.props.autogradingResults.length > 0 ? (
        this.props.autogradingResults.map((result, index) => (
          <ResultCard key={index} index={index} result={result} />
        ))
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
