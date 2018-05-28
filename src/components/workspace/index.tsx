import * as React from 'react'

import Resizable from 're-resizable'

import EditorContainer from '../../containers/workspace/EditorContainer'
import ReplContainer from '../../containers/workspace/ReplContainer'

export interface IIDEProps {
  editorWidth: string
  handleEditorWidthChange: (widthChange: number) => void // TODO
}

class IDE extends React.Component<IIDEProps, {}> {
  public render() {
    return (
      <div className="workspace">
        <div className="row ide-content-parent">
          <Resizable
            className="editor-parent"
            size={{ width: this.props.editorWidth, height: '100%' }}
            maxWidth={window.innerWidth - 10}
            // tslint:disable-next-line jsx-no-lambda
            onResizeStop={(e, direction, ref, d) => {
              this.props.handleEditorWidthChange(d.width * 100 / window.innerWidth)
            }}
            enable={{
              top: false,
              right: true,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
          >
            <EditorContainer />
          </Resizable>
          <div className="repl-parent">
            <ReplContainer />
          </div>
        </div>
      </div>
    )
  }
}

export default IDE
