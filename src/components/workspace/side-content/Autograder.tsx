
import * as React from 'react';
import { ITestcase } from '../../assessment/assessmentShape';
import AutograderCard from './AutograderCard';

type AutograderProps = {
    testcases: ITestcase[] | null;
    handleTestcaseEval: (testcaseId: number) => void;
};


class Autograder extends React.Component<AutograderProps, {}> {

  public render() {
    return this.props.testcases != null 
        ? this.props.testcases.map((testcase, index) =>
           <div key={index}>
            <AutograderCard index={index} testcase={testcase} handleTestcaseEval={this.props.handleTestcaseEval} /> 
            </div>)
        : <div>There are no testcases provided for this mission.</div>;
    }
}


export default Autograder;