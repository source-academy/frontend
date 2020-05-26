import * as React from 'react';
import { overrideSessionData } from '../../academy/game/backend/game-state.js';

class StoryXmlUpload extends React.Component {
  private static onFormSubmit(e: { preventDefault: () => void }) {
    e.preventDefault(); // Stop form submit
  }

  constructor(props: Readonly<{}>) {
    super(props);
  }

  public render() {
    return (
      <form onSubmit={StoryXmlUpload.onFormSubmit} id="json-upload">
        <h3>Story Xml Upload</h3>
        <input type="file" onChange={this.onChange} style={{ width: '250px' }} />
      </form>
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

export default StoryXmlUpload;
