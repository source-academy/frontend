import * as React from 'react';
import AceEditor from 'react-ace';

import { defaultGameStateText } from '../../../../features/storySimulator/StorySimulatorTypes';
import { overrideSessionData } from '../../../../features/storySimulator/StorySimulatorServices';

function JsonUpload() {
  const [editorContent, setEditorContent] = React.useState(defaultGameStateText);

  return (
    <div className="Vertical">
      <div className="JsonUpload VerticalStack">
        <h3>Game State Loader</h3>
        <input type="file" onChange={onUpload} style={{ width: '250px' }} />
        <div className="AceEditor">
          <AceEditor value={editorContent} theme="source" onChange={onEdit} />
        </div>
      </div>
    </div>
  );

  function onUpload(e: { target: any }) {
    const reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onloadend = _ => {
      if (typeof reader.result === 'string') {
        overrideSessionData(JSON.parse(reader.result));
        setEditorContent(reader.result);
      }
    };
  }

  function onEdit(newCode: string) {
    try {
      overrideSessionData(JSON.parse(newCode));
    } catch (e) {}
  }
}

export default JsonUpload;
