import * as React from 'react';
import { overrideGameState } from '../academy/game/backend/game-state.js';

class JsonUpload extends React.Component {
  private static onFormSubmit(e: { preventDefault: () => void; }){
    e.preventDefault(); // Stop form submit
  }

  constructor(props: Readonly<{}>) {
    super(props);
    overrideGameState(undefined);
    JsonUpload.onFormSubmit = JsonUpload.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  public render() {
    return (
      <form onSubmit={JsonUpload.onFormSubmit}>
        <h3>Game State Override</h3>
        <input type="file" onChange={this.onChange} style={{width: "250px"}}/>
      </form>
    );
  }
  private onChange(e: { target: { files: any; }; }) {
    const reader = new FileReader();
    reader.onload = (event: Event) => {
      overrideGameState(JSON.parse(""+reader.result));
    };
    reader.readAsText(e.target.files[0]);
  }
}


export default JsonUpload;
