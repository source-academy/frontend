import { NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import GradingEditor from '../../../containers/academy/grading/GradingEditorContainer'
import { InterpreterOutput } from '../../../reducers/states'
import { history } from '../../../utils/history'
import {
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion,
  QuestionTypes
} from '../../assessment/assessmentShape'
import Workspace, { WorkspaceProps } from '../../workspace'
import { ControlBarProps } from '../../workspace/ControlBar'
import { SideContentProps } from '../../workspace/side-content'
import { Grading } from './gradingShape'

export type GradingWorkspaceProps = DispatchProps & OwnProps & StateProps

export type StateProps = {
  activeTab: number
  grading?: Grading
  editorValue?: string
  editorWidth: string
  isRunning: boolean
  output: InterpreterOutput[]
  replValue: string
  sideContentHeight?: number
}

export type OwnProps = {
  submissionId: number
  questionId: number
}

export type DispatchProps = {
  handleGradingFetch: (submissionId: number) => void
  handleChangeActiveTab: (activeTab: number) => void
  handleChapterSelect: (chapter: any, changeEvent: any) => void
  handleEditorEval: () => void
  handleEditorValueChange: (val: string) => void
  handleEditorWidthChange: (widthChange: number) => void
  handleInterruptEval: () => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
  handleReplValueChange: (newValue: string) => void
  handleSideContentHeightChange: (heightChange: number) => void
}

class GradingWorkspace extends React.Component<GradingWorkspaceProps> {
  public componentWillMount() {
    this.props.handleGradingFetch(this.props.submissionId)
  }

  public render() {
    if (this.props.grading === undefined) {
      return (
        <NonIdealState
          className="AssessmentWorkspace pt-dark"
          description="Getting assessment ready..."
          visual={<Spinner large={true} />}
        />
      )
    }

    /* Get the question to be graded */
    const question = this.props.grading[this.props.questionId].question as IQuestion
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(this.props),
      editorProps:
        question.type === QuestionTypes.programming
          ? {
              editorValue:
                this.props.editorValue !== undefined
                  ? this.props.editorValue
                  : (question as IProgrammingQuestion).solutionTemplate,
              handleEditorEval: this.props.handleEditorEval,
              handleEditorValueChange: this.props.handleEditorValueChange
            }
          : undefined,
      editorWidth: this.props.editorWidth,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      mcq: question as IMCQQuestion,
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: this.sideContentProps(this.props),
      replProps: {
        output: this.props.output,
        replValue: this.props.replValue,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange
      }
    }
    return (
      <div className="AssessmentWorkspace pt-dark">
        <Workspace {...workspaceProps} />
      </div>
    )
  }

  /** Pre-condition: Grading has been loaded */
  private sideContentProps: (p: GradingWorkspaceProps) => SideContentProps = (
    props: GradingWorkspaceProps
  ) => ({
    activeTab: props.activeTab,
    handleChangeActiveTab: props.handleChangeActiveTab,
    tabs: [
      {
        label: `Grading: Question ${props.questionId}`,
        icon: IconNames.TICK,
        /* Render an editor with the xp given to the current question. */
        body: <GradingEditor maximumXP={props.grading![props.questionId].maximumXP} />
      },
      {
        label: `Task ${props.questionId}`,
        icon: IconNames.NINJA,
        body: <Text> {props.grading![props.questionId].question.content} </Text>
      }
    ]
  })

  /** Pre-condition: Grading has been loaded */
  private controlBarProps: (p: GradingWorkspaceProps) => ControlBarProps = (
    props: GradingWorkspaceProps
  ) => {
    const listingPath = `/academy/grading`
    const gradingWorkspacePath = listingPath + `/${this.props.submissionId}`
    return {
      handleChapterSelect: this.props.handleChapterSelect,
      handleEditorEval: this.props.handleEditorEval,
      handleInterruptEval: this.props.handleInterruptEval,
      handleReplEval: this.props.handleReplEval,
      handleReplOutputClear: this.props.handleReplOutputClear,
      hasChapterSelect: false,
      hasDoneButton: this.props.questionId === this.props.grading!.length - 1,
      hasNextButton: this.props.questionId < this.props.grading!.length - 1,
      hasPreviousButton: this.props.questionId > 0,
      hasSaveButton: false,
      hasShareButton: false,
      isRunning: this.props.isRunning,
      onClickDone: () => history.push(listingPath),
      onClickNext: () =>
        history.push(gradingWorkspacePath + `/${(this.props.questionId + 1).toString()}`),
      onClickPrevious: () =>
        history.push(gradingWorkspacePath + `/${(this.props.questionId - 1).toString()}`),
      sourceChapter: 2 // TODO dynamic library changing
    }
  }
}

export default GradingWorkspace
