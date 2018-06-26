import { Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { decompressFromEncodedURIComponent } from 'lz-string'
import * as qs from 'query-string'
import * as React from 'react'
import { HotKeys } from 'react-hotkeys'
import { RouteComponentProps } from 'react-router'

import { InterpreterOutput, sourceChapters } from '../reducers/states'
import Workspace, { WorkspaceProps } from './workspace'
import { SideContentTab } from './workspace/side-content'

export interface IPlaygroundProps extends IDispatchProps, IStateProps, RouteComponentProps<{}> {}

export interface IStateProps {
  editorValue: string,
  sideContentHeight: number,
  isRunning: boolean,
  activeTab: number,
  editorWidth: string,
  output: InterpreterOutput[], 
  replValue: string
}

export interface IDispatchProps {
  handleEditorValueChange: () => void 
  handleChapterSelect: (i: any, e: any) => void,
  handleChangeActiveTab: (n: number) => void
  handleEditorEval: () => void, 
  handleReplEval: () => void, 
  handleReplOutputClear: () => void,
  handleInterruptEval: () => void, 
  handleEditorWidthChange: (n: number) => void, 
  handleSideContentHeightChange: (h: number) => void, 
  handleReplValueChange: (code: string) => void
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
      editorProps: {
        editorValue: parsePrgrm(this.props) || this.props.editorValue,
        handleEditorEval: this.props.handleEditorEval,
        handleEditorValueChange: this.props.handleEditorValueChange
      },
      controlBarProps: {
        sourceChapter: parseLibrary(this.props) || 2,
        handleChapterSelect: this.props.handleChapterSelect, 
        handleEditorEval: this.props.handleEditorEval,
        handleReplEval: this.props.handleReplEval,
        handleReplOutputClear: this.props.handleReplOutputClear,
        handleInterruptEval: this.props.handleInterruptEval,
        isRunning: this.props.isRunning, 
        hasNextButton: false,
        hasPreviousButton: false,
        hasSubmitButton: false
      },
      sideContentProps: {
        activeTab: this.props.activeTab,
        tabs: [playgroundIntroduction],
        handleChangeActiveTab: this.props.handleChangeActiveTab
      },
      editorWidth: this.props.editorWidth,
      sideContentHeight: this.props.sideContentHeight,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      replProps: { 
        output: this.props.output,
        replValue: this.props.replValue,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange
      }
    }
    return (
      <HotKeys
        className={'Playground pt-dark' + (this.state.isGreen ? ' GreenScreen' : '')}
        keyMap={this.keyMap}
        handlers={this.handlers}
      >
        <Workspace {...workspaceProps } />
      </HotKeys>
    )
  }

  private toggleIsGreen() {
    this.setState({ isGreen: !this.state.isGreen })
  }
}

const parsePrgrm = (props: IPlaygroundProps) => {
  const qsParsed = qs.parse(props.location.hash)
  // legacy support
  const program = qsParsed.lz !== undefined ? qsParsed.lz : qsParsed.prgrm
  return program !== undefined ? decompressFromEncodedURIComponent(program) : undefined
}

const parseLibrary = (props: IPlaygroundProps) => {
  const libQuery = qs.parse(props.location.hash).lib
  const lib = libQuery === undefined ? NaN : parseInt(libQuery, 10)
  return sourceChapters.includes(lib) ? lib : undefined
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
