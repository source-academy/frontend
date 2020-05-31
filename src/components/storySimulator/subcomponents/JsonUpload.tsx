import * as React from 'react';
import AceEditor from 'react-ace';

import { overrideSessionData } from '../../academy/game/backend/gameState';
import { defaultGameStateText } from '../features/StorySimulatorConstants';

class JsonUpload extends React.Component {
  private static onFormSubmit(e: { preventDefault: () => void }) {
    e.preventDefault(); // Stop form submit
  }

  constructor(props: Readonly<{}>) {
    super(props);
    overrideSessionData(undefined);
    JsonUpload.onFormSubmit = JsonUpload.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  public render() {
    return (
      <div className="VerticalStack">
        <form onSubmit={JsonUpload.onFormSubmit} id="json-upload">
          <h3>Game State Loader</h3>
          <input type="file" onChange={this.onChange} style={{ width: '250px' }} />

          <div className="AceEditor">
            <AceEditor value={defaultGameStateText} theme="source" />
          </div>
        </form>
      </div>
    );
  }
  private onChange(e: { target: any }) {
    const reader = new FileReader();
    reader.onloadend = (event: Event) => {
      if (typeof reader.result === 'string') {
        overrideSessionData(JSON.parse(reader.result));
      }
    };
    if (e.target.files && e.target.files[0] instanceof Blob) {
      reader.readAsText(e.target.files[0]);
    } else {
      overrideSessionData(undefined);
      e.target.value = null;
    }
  }
}

export default JsonUpload;
