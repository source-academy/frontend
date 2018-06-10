import { decompressFromEncodedURIComponent } from 'lz-string'
import Resizable, { ResizableProps, ResizeCallback } from 're-resizable'
import * as React from 'react'
import { HotKeys } from 'react-hotkeys'

import ControlBarContainer from '../../containers/workspace/ControlBarContainer'
import EditorContainer from '../../containers/workspace/EditorContainer'
import ReplContainer from '../../containers/workspace/ReplContainer'
import SideContent from '../../containers/workspace/SideContentContainer'
import { OwnProps as ControlBarOwnProps } from './ControlBar'
import { SideContentTab } from './side-content'

type WorkspaceProps = DispatchProps & OwnProps & StateProps

export type DispatchProps = {
  changeChapter: (newChapter: number) => void
  handleEditorWidthChange: (widthChange: number) => void
  handleSideContentHeightChange: (height: number) => void
  updateEditorValue: (newEditorValue: string) => void
}

export type OwnProps = {
  controlBarOptions?: ControlBarOwnProps
  libQuery?: number
  sideContentTabs: SideContentTab[]
  prgrmQuery?: string
}

export type StateProps = {
  editorWidth: string
  sideContentHeight?: number
}

class Workspace extends React.Component<WorkspaceProps, {}> {
  private editorDividerDiv: HTMLDivElement
  private leftParentResizable: Resizable
  private maxDividerHeight: number
  private sideDividerDiv: HTMLDivElement

  public componentDidMount() {
    this.maxDividerHeight = this.sideDividerDiv.clientHeight
    if (this.props.prgrmQuery !== undefined) {
      const prgrmParsed = decompressFromEncodedURIComponent(this.props.prgrmQuery)
      this.props.updateEditorValue(prgrmParsed)
    }
    if (this.props.libQuery !== undefined) {
      this.props.changeChapter(this.props.libQuery)
    }
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
        <ControlBarContainer {...this.props.controlBarOptions} />
        <div className="row workspace-parent">
          <div className="editor-divider" ref={e => (this.editorDividerDiv = e!)} />
          <Resizable {...this.editorResizableProps()}>
            <EditorContainer />
          </Resizable>
          <div className="right-parent">
            <Resizable {...this.sideContentResizableProps()}>
              <SideContent {...{ tabs: this.props.sideContentTabs }} />
              <div className="side-content-divider" ref={e => (this.sideDividerDiv = e!)} />
            </Resizable>
            <ReplContainer />
          </div>
        </div>
      </HotKeys>
    )
  }

  private editorResizableProps() {
    const onResizeStop: ResizeCallback = ({}, {}, {}, diff) =>
      this.props.handleEditorWidthChange(diff.width * 100 / window.innerWidth)
    const ref = (e: Resizable) => (this.leftParentResizable = e as Resizable)
    return {
      className: 'resize-editor left-parent',
      enable: rightResizeOnly,
      minWidth: 0,
      onResize: this.toggleEditorDividerDisplay,
      onResizeStop,
      ref,
      size: { width: this.props.editorWidth, height: '100%' }
    } as ResizableProps
  }

  private sideContentResizableProps() {
    const size =
      this.props.sideContentHeight === undefined
        ? undefined
        : { height: this.props.sideContentHeight, width: '100%' }
    const onResizeStop: ResizeCallback = ({}, {}, ref, {}) =>
      this.props.handleSideContentHeightChange(ref.clientHeight)
    return {
      bounds: 'parent',
      className: 'resize-side-content',
      enable: bottomResizeOnly,
      minHeight: 0,
      onResize: this.toggleDividerDisplay,
      onResizeStop,
      size
    } as ResizableProps
  }

  /**
   * Snaps the left-parent resizable to 100% or 0% when percentage width goes
   * above 95% or below 5% respectively. Also changes the editor divider width
   * in the case of < 5%.
   */
  private toggleEditorDividerDisplay: ResizeCallback = ({}, {}, ref) => {
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
  private toggleDividerDisplay: ResizeCallback = ({}, {}, ref) => {
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
