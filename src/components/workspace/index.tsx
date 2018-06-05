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

type WorkspaceState = {
  maxSideHeight?: number
}

class Workspace extends React.Component<IWorkspaceProps, WorkspaceState> {
  private rightParentDiv: HTMLDivElement

  public constructor(props: IWorkspaceProps) {
    // use local state to keep track of max height of side-content
    super(props)
    this.state = { maxSideHeight: undefined }
  }

  public componentDidMount() {
    window.addEventListener('resize', this.updateMaxSideHeight.bind(this))
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.updateMaxSideHeight.bind(this))
  }

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
          <div className="right-parent" ref={e => (this.rightParentDiv = e as HTMLDivElement)}>
            <Resizable
              className="resize-side-content"
              maxHeight={this.state.maxSideHeight}
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
            </Resizable>
            <ReplContainer />
          </div>
        </div>
      </HotKeys>
    )
  }

  private updateMaxSideHeight() {
    this.setState({ maxSideHeight: this.rightParentDiv.clientHeight - 10 })
  }
}

const handlers = {
  goGreen: () => require('../../styles/workspace-green.css')
}

export default Workspace
