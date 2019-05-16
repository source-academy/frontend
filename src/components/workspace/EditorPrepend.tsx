import * as React from 'react';
import AceEditor from 'react-ace';
import { HotKeys } from 'react-hotkeys';

import 'brace/mode/javascript';
import 'brace/theme/cobalt';
import 'brace/theme/terminal';

export interface IEditorPrependProps {
  editorPrependValue: string;
}

class EditorPrepend extends React.PureComponent<IEditorPrependProps, {}> {
  public AceEditor: React.RefObject<AceEditor>;

  constructor(props: IEditorPrependProps) {
    super(props);
    this.AceEditor = React.createRef();
  }

  public render() {
    return (
      <HotKeys className="Editor" handlers={handlers}>
        <div className="row editor-prepend-react-ace">
          <AceEditor
            className="react-ace"
            mode="javascript"
            theme="cobalt"
            height="100%"
            width="100%"
            value={this.props.editorPrependValue}
            editorProps={{
              $blockScrolling: Infinity
            }}
            fontSize={14}
            highlightActiveLine={false}
            readOnly={true}
            ref={this.AceEditor}
          />
        </div>
      </HotKeys>
    );
  }
}

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

export default EditorPrepend;
