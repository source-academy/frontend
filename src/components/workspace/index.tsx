import Resizable, { ResizeCallback } from 're-resizable'
import * as React from 'react'
import { HotKeys } from 'react-hotkeys'

import ControlBarContainer from '../../containers/workspace/ControlBarContainer'
import EditorContainer from '../../containers/workspace/EditorContainer'
import ReplContainer from '../../containers/workspace/ReplContainer'
import SideContent from '../../containers/workspace/SideContentContainer'
import { SideContentTab } from './side-content'

interface IWorkspaceProps {
  editorWidth: string
  sideContentHeight?: number
  sideContentTabs: SideContentTab[]
  handleEditorWidthChange: (widthChange: number) => void
  handleSideContentHeightChange: (height: number) => void
}

export type DispatchProps = Pick<IWorkspaceProps, 'handleEditorWidthChange'> &
  Pick<IWorkspaceProps, 'handleSideContentHeightChange'>

export type OwnProps = Pick<IWorkspaceProps, 'sideContentTabs'>

export type StateProps = Pick<IWorkspaceProps, 'editorWidth'> &
  Pick<IWorkspaceProps, 'sideContentHeight'>

class Workspace extends React.Component<IWorkspaceProps, {}> {
  private sideDividerDiv: HTMLDivElement
  private maxDividerHeight: number
  private leftParentResizable: Resizable
  private editorDividerDiv: HTMLDivElement

  public componentDidMount() {
    this.maxDividerHeight = this.sideDividerDiv.clientHeight
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
          <div
            className="editor-divider"
            ref={e => (this.editorDividerDiv = e as HTMLDivElement)}
          />
          <Resizable
            className="resize-editor left-parent"
            size={{ width: this.props.editorWidth, height: '100%' }}
            minWidth={0}
            onResize={this.toggleEditorDividerDisplay}
            // tslint:disable-next-line jsx-no-lambda
            onResizeStop={(e, dir, ref, diff) => {
              this.props.handleEditorWidthChange(diff.width * 100 / window.innerWidth)
            }}
            enable={rightResizeOnly}
            ref={e => (this.leftParentResizable = e as Resizable)}
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
              <SideContent {...{ tabs: this.props.sideContentTabs }} />
              <div
                className="side-content-divider"
                ref={e => (this.sideDividerDiv = e as HTMLDivElement)}
              />
            </Resizable>
            <ReplContainer />
          </div>
        </div>
      </HotKeys>
    )
  }

  /**
   * Snaps the left-parent resizable to 100% or 0% when percentage width goes
   * above 95% or below 5% respectively. Also changes the editor divider width
   * in the case of < 5%.
   */
  private toggleEditorDividerDisplay: ResizeCallback = (e, dir, ref) => {
    const leftThreshold = 2
    const rightThreshold = 95
    const editorWidthPercentage = (ref as HTMLDivElement).clientWidth / window.innerWidth * 100
    // update resizable size
    if (editorWidthPercentage > rightThreshold) {
      this.leftParentResizable.updateSize({ width: '100%', height: '100%' })
    } else if (editorWidthPercentage < leftThreshold) {
      this.leftParentResizable.updateSize({ width: '0%', height: '100%' })
    }
    // Update divider margin
    if (editorWidthPercentage < leftThreshold) {
      this.editorDividerDiv.style.marginRight = '0.6rem'
    } else {
      this.editorDividerDiv.style.marginRight = '0'
    }
  }

  /**
   * Hides the side-content-divider div when side-content is resized downwards
   * so that it's bottom border snaps flush with editor's bottom border
   */
  private toggleDividerDisplay: ResizeCallback = (e, dir, ref) => {
    this.maxDividerHeight =
      this.sideDividerDiv.clientHeight > this.maxDividerHeight
        ? this.sideDividerDiv.clientHeight
        : this.maxDividerHeight
    const resizableHeight = (ref as HTMLDivElement).clientHeight
    const rightParentHeight = (ref.parentNode as HTMLDivElement).clientHeight
    if (resizableHeight + this.maxDividerHeight + 2 > rightParentHeight) {
      this.sideDividerDiv.style.display = 'none'
    } else {
      this.sideDividerDiv.style.display = 'initial'
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
