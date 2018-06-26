import Resizable, { ResizableProps, ResizeCallback } from 're-resizable'
import * as React from 'react'

import { IMCQQuestion } from '../assessment/assessmentShape'
import ControlBar, { ControlBarProps } from './ControlBar'
import Editor, { IEditorProps } from './Editor'
import MCQChooser from './MCQChooser'
import Repl, { IReplProps } from './Repl'
import SideContent, { SideContentProps } from './side-content'

export type WorkspaceProps = {
  // Either editorProps or mcq must be provided
  controlBarProps: ControlBarProps
  editorProps?: IEditorProps
  editorWidth: string
  handleEditorWidthChange: (widthChange: number) => void
  handleSideContentHeightChange: (height: number) => void
  mcq?: IMCQQuestion
  replProps: IReplProps
  sideContentHeight: number
  sideContentProps: SideContentProps
}

class Workspace extends React.Component<WorkspaceProps, {}> {
  private editorDividerDiv: HTMLDivElement
  private leftParentResizable: Resizable
  private maxDividerHeight: number
  private sideDividerDiv: HTMLDivElement

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
      <div className="workspace">
        <ControlBar {...this.props.controlBarProps} />
        <div className="row workspace-parent">
          <div className="editor-divider" ref={e => (this.editorDividerDiv = e!)} />
          <Resizable {...this.editorResizableProps()}>{this.workspaceInput(this.props)}</Resizable>
          <div className="right-parent">
            <Resizable {...this.sideContentResizableProps()}>
              <SideContent {...this.props.sideContentProps } />
              <div className="side-content-divider" ref={e => (this.sideDividerDiv = e!)} />
            </Resizable>
            <Repl { ...this.props.replProps } />
          </div>
        </div>
      </div>
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
    const onResizeStop: ResizeCallback = ({}, {}, ref, {}) =>
      this.props.handleSideContentHeightChange(ref.clientHeight)
    return {
      bounds: 'parent',
      className: 'resize-side-content',
      enable: bottomResizeOnly,
      minHeight: 0,
      onResize: this.toggleDividerDisplay,
      onResizeStop,
      size: {
        height: this.props.sideContentHeight,
        width: '100%' 
      }
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

  private workspaceInput = (props: WorkspaceProps) => {
    if (props.editorProps !== undefined) {
      return <Editor { ...props.editorProps } />
    } else {
      return <MCQChooser mcq={this.props.mcq!} />
    }
  }
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
