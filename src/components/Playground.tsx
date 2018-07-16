import { Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { HotKeys } from 'react-hotkeys'
import { RouteComponentProps } from 'react-router'

import { InterpreterOutput } from '../reducers/states'
import Workspace, { WorkspaceProps } from './workspace'
import { SideContentTab } from './workspace/side-content'

export interface IPlaygroundProps extends IDispatchProps, IStateProps, RouteComponentProps<{}> {}

export interface IStateProps {
  activeTab: number
  editorValue: string
  editorWidth: string
  isRunning: boolean
  output: InterpreterOutput[]
  queryString?: string
  replValue: string
  sideContentHeight?: number
  sourceChapter: number
  externalLibrary: string
}

export interface IDispatchProps {
  handleChangeActiveTab: (activeTab: number) => void
  handleChapterSelect: (chapter: any, changeEvent: any) => void
  handleEditorEval: () => void
  handleEditorValueChange: (val: string) => void
  handleEditorWidthChange: (widthChange: number) => void
  handleGenerateLz: () => void
  handleInterruptEval: () => void
  handleExternalSelect: (external: any, changeEvent: any) => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
  handleReplValueChange: (newValue: string) => void
  handleSideContentHeightChange: (heightChange: number) => void
}

type PlaygroundState = {
  isGreen: boolean
}

class Playground extends React.Component<IPlaygroundProps, PlaygroundState> {
  private keyMap = { goGreen: 'h u l k' }

  private handlers = { goGreen: () => {} }

  constructor(props: IPlaygroundProps) {
    super(props)
    this.state = { isGreen: false }
    this.handlers.goGreen = this.toggleIsGreen.bind(this)
  }

  public render() {
    const workspaceProps: WorkspaceProps = {
      controlBarProps: {
        externalLibrary: this.props.externalLibrary,
        handleChapterSelect: this.props.handleChapterSelect,
        handleExternalSelect: this.props.handleExternalSelect,
        handleEditorEval: this.props.handleEditorEval,
        handleGenerateLz: this.props.handleGenerateLz,
        handleInterruptEval: this.props.handleInterruptEval,
        handleReplEval: this.props.handleReplEval,
        handleReplOutputClear: this.props.handleReplOutputClear,
        hasChapterSelect: true,
        hasDoneButton: false,
        hasNextButton: false,
        hasPreviousButton: false,
        hasSaveButton: false,
        hasShareButton: true,
        isRunning: this.props.isRunning,
        queryString: this.props.queryString,
        sourceChapter: this.props.sourceChapter
      },
      editorProps: {
        editorValue: this.props.editorValue,
        handleEditorEval: this.props.handleEditorEval,
        handleEditorValueChange: this.props.handleEditorValueChange
      },
      editorWidth: this.props.editorWidth,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      replProps: {
        output: this.props.output,
        replValue: this.props.replValue,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange
      },
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: {
        activeTab: this.props.activeTab,
        handleChangeActiveTab: this.props.handleChangeActiveTab,
        tabs: [playgroundIntroduction]
      }
    }
    return (
      <HotKeys
        className={'Playground pt-dark' + (this.state.isGreen ? ' GreenScreen' : '')}
        keyMap={this.keyMap}
        handlers={this.handlers}
      >
        <Workspace {...workspaceProps} />
      </HotKeys>
    )
  }

  private toggleIsGreen() {
    this.setState({ isGreen: !this.state.isGreen })
  }
}

const SICP_SITE = 'http://www.comp.nus.edu.sg/~henz/sicp_js/'
const CHAP = '\xa7'
const playgroundIntroduction: SideContentTab = {
  label: 'Introduction',
  icon: IconNames.COMPASS,
  body: (
    <Text>
      Welcome to the source-academy playground!
      <br />
      <br />
      The language <i>Source</i> is the official language of the textbook{' '}
      <i>Structure and Interpretation of Computer Programs, JavaScript Adaptation</i>. You have
      never heard of Source? No worries! It was invented just for the purpose of the book. Source is
      a sublanguage of ECMAScript 2016 (7th Edition) and defined in{' '}
      <a href={SICP_SITE}>
        {' '}
        the documents titled <i>"Source {CHAP}x"</i>
      </a>, where x refers to the respective textbook chapter. For example, Source {CHAP}3 is
      suitable for textbook Chapter 3 and the preceeding chapters.
      <br />
      <br />
      The playground comes with an editor and a REPL, on the left and right of the screen,
      respectively. You may customimse the layout of the playground by clicking and dragging on the
      right border of the editor, or the top border of the REPL.
    </Text>
  )
}

export default Playground
