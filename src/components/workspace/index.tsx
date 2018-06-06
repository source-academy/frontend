import Resizable, { ResizeCallback } from 're-resizable'
import * as React from 'react'
import { HotKeys } from 'react-hotkeys'

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
  private dividerDiv: HTMLDivElement
  private maxDividerHeight: number

  public componentDidMount() {
    this.maxDividerHeight = this.dividerDiv.clientHeight
  }

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
            enable={rightResizeOnly}
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
              onResize={this.toggleDividerDisplay}
              // tslint:disable-next-line jsx-no-lambda
              onResizeStop={(e, dir, ref, diff) => {
                this.props.handleSideContentHeightChange(ref.clientHeight)
              }}
              enable={bottomResizeOnly}
            >
              <SideContent />
              <div
                className="side-content-divider"
                ref={e => (this.dividerDiv = e as HTMLDivElement)}
              />
            </Resizable>
            <ReplContainer />
          </div>
        </div>
      </HotKeys>
    )
  }

  /**
   * Hides the side-content-divider div when side-content is resized downwards
   * so that it's bottom border snaps flush with editor's bottom border
   */
  private toggleDividerDisplay: ResizeCallback = (e, dir, ref) => {
    this.maxDividerHeight =
      this.dividerDiv.clientHeight > this.maxDividerHeight
        ? this.dividerDiv.clientHeight
        : this.maxDividerHeight
    const resizableHeight = (ref as HTMLDivElement).clientHeight
    const rightParentHeight = (ref.parentNode as HTMLDivElement).clientHeight
    if (resizableHeight + this.maxDividerHeight + 2 > rightParentHeight) {
      this.dividerDiv.style.display = 'none'
    } else {
      this.dividerDiv.style.display = 'initial'
    }
  }
}

const handlers = {
  goGreen: () => require('../../styles/workspace-green.css')
}

const rightResizeOnly = {
  top: false,
  right: true,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false
}

const bottomResizeOnly = {
  top: false,
  right: false,
  bottom: true,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false
}

export default Workspace
