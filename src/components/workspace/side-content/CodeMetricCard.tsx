import { Card, Classes, Elevation, Pre } from '@blueprintjs/core';
import * as React from 'react';
import CountToken from '../../../assets/scripts/countToken';
import MeasureRunTime from '../../../assets/scripts/measureRuntime';

type CodeMetircCardProps = {
  program: string;
};

class CodeMetircCard extends React.Component<CodeMetircCardProps, {}> {
  private runTime = 0;

  public render() {
    return (
      <div className={'CodeMetircCard'}>
        <Card>
          <Pre className="Length">{'Length: ' + this.props.program.length}</Pre>
        </Card>
        <Card>
          <Pre className="TokenCount">{'Number of tokens: ' + CountToken(this.props.program)}</Pre>
        </Card>
        <Card className={Classes.INTERACTIVE} elevation={Elevation.ONE} onClick={this.evalSelf}>
          <Pre className="RunTime">{'Run time: ' + this.runTime + ' ms'}</Pre>
        </Card>
      </div>
    );
  }

  // Enable clicks on the card to run the testcase
  private evalSelf = () => {
    this.runTime = MeasureRunTime(this.props.program, 4);
    this.forceUpdate();
  };
}

export default CodeMetircCard;
