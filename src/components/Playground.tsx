import * as React from 'react'
import AceEditor from 'react-ace'

export interface IPlaygroundProps {
  initialCode: string;
  updateCode: (newCode: string) => void;
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
          onChange={this.props.updateCode}
        />
      </div>
    );
  }
}
