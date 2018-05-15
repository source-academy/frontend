import * as React from 'react'
import AceEditor from 'react-ace'


export interface IPlaygroundProps {
  initialCode: string;
};

function onChange(newValue : string) : void {
  // console.log('change', newValue);
}

export default class Playground extends React.Component<IPlaygroundProps, {}> {
  public render() {
    return (
      <div className="Playground">
       <h2>Playground</h2>
        <AceEditor 
          value={this.props.initialCode}
          onChange={onChange} />
      </div>
    );
  }
}
