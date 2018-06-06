import * as React from 'react'
import { HotKeys } from 'react-hotkeys'

import Resizable from 're-resizable'

import ControlBarContainer from '../../containers/workspace/ControlBarContainer'
import EditorContainer from '../../containers/workspace/EditorContainer'
import ReplContainer from '../../containers/workspace/ReplContainer'
import SideContent from './side-content'

export interface IWorkspaceProps {
  editorWidth: string
  sideContentHeight?: number
  handleEditorWidthChange: (widthChange: number) => void
  handleSideContentHeightChange: (height: number) => void
}

class Workspace extends React.Component<IWorkspaceProps, {}> {
  /**
   * side-content-divider gives the side content a bottom margin. I use a div
   * element instead of CSS so that when the user resizes the side-content all
   * the way up in order to hide it, there won't be a padding there to stop the
   * REPL from being flush with the top of the editor
   */
  public render() {
    return (
      <HotKeys className="workspace" handlers={handlers}>
        <ControlBarContainer />
        <div className="row workspace-parent">
          <Resizable
            className="left-parent"
            size={{ width: this.props.editorWidth, height: '100%' }}
            maxWidth={window.innerWidth - 10}
            // tslint:disable-next-line jsx-no-lambda
            onResizeStop={(e, dir, ref, diff) => {
              this.props.handleEditorWidthChange(diff.width * 100 / window.innerWidth)
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
            <Resizable
              bounds="parent"
              className="resize-side-content"
              minHeight={0}
              size={
                this.props.sideContentHeight === undefined
                  ? undefined
                  : { height: this.props.sideContentHeight, width: '100%' }
              }
              // tslint:disable-next-line jsx-no-lambda
              onResizeStop={(e, dir, ref, diff) => {
                this.props.handleSideContentHeightChange(ref.clientHeight)
              }}
              enable={{
                top: false,
                right: false,
                bottom: true,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false
              }}
            >
              <SideContent />
              <div className="side-content-divider" />
            </Resizable>
            <ReplContainer />
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
