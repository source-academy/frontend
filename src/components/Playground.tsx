import * as React from 'react'
import AceEditor from 'react-ace'
import 'brace/mode/java';
import 'brace/theme/github';

export interface IPlaygroundProps {
  initialCode: string;
};

export default class Playground extends React.Component<IPlaygroundProps, {}> {
  public render() {
    return (
      <div className="Playground">
       <h2>Playground</h2>
        <AceEditor 
          mode="java"
          theme="github"
          value={this.props.initialCode}
        />
      </div>
    );
  }
}
