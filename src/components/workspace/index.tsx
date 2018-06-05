import * as React from 'react'
import { HotKeys } from 'react-hotkeys'

import Resizable from 're-resizable'

import ControlBarContainer from '../../containers/workspace/ControlBarContainer'
import EditorContainer from '../../containers/workspace/EditorContainer'
import ReplContainer from '../../containers/workspace/ReplContainer'
import SideContent from './side-content'

export interface IWorkspaceProps {
  editorWidth: string
  handleEditorWidthChange: (widthChange: number) => void // TODO
}

class Workspace extends React.Component<IWorkspaceProps, {}> {
  public render() {
    return (
      <HotKeys className="workspace" handlers={handlers}>
        <ControlBarContainer />
        <div className="row left-parent">
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
          <div className="right-parent">
            <ReplContainer />
            <SideContent />
          </div>
        </div>
      </HotKeys>
    )
  }
}

const handlers = {
  goGreen: () => require('../../styles/workspace-green.css')
}

export default Workspace
