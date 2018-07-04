import { Button, Card, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import { InterpreterOutput } from '../../reducers/states'
import { history } from '../../utils/history'
import Workspace, { WorkspaceProps } from '../workspace'
import { ControlBarProps } from '../workspace/ControlBar'
import { SideContentProps } from '../workspace/side-content'
import {
  // TODO Grading,
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion,
  QuestionTypes
} from './assessmentShape'

export type GradingWorkspaceProps = DispatchProps & OwnProps & StateProps

export type StateProps = {
  activeTab: number
  // TODO grading?: Grading
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
  // TODO handleSubmissionFetch: (assessmentId: number) => void
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

class GradingWorkspace extends React.Component<
  GradingWorkspaceProps> {
  public state = { showOverlay: false }

  public componentWillMount() {
    this.props.handleAssessmentFetch(this.props.assessmentId)
    if (this.props.questionId === 0) {
      this.setState({ showOverlay: true })
    }
  }

  public render() {
    if (this.props.grading === undefined) {
      return (
        <NonIdealState
          className="GradingWorkspace pt-dark"
          description="Getting assessment ready..."
          visual={<Spinner large={true} />}
        />
      )
    }
    /* Get the question to be graded */
    const question: IQuestion = this.props.grading[this.props.questionId]
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
      <div className="GradingWorkspace pt-dark">
        {overlay}
        <Workspace {...workspaceProps} />
      </div>
    )
  }

  /** TODO Pre-condition: Grading has been loaded */
  private sideContentProps: (p: GradingWorkspaceProps) => SideContentProps = (
    props: GradingWorkspaceProps
  ) => ({
    activeTab: 0,
    handleChangeActiveTab: (aT: number) => {},
    tabs: [
      {
        label: `Grading: Question ${props.questionId}`,
        icon: IconNames.NINJA,
        // TODO
        body: <Text> {props.grading![props.questionId].content} </Text>
      }
    ]
  })

  /** TODO Pre-condition: Grading has been loaded */
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
      hasNextButton: this.props.questionId < this.props.grading!.length - 1,
      hasPreviousButton: this.props.questionId > 0,
      hasSaveButton: true,
      hasShareButton: false,
      hasSubmitButton: this.props.questionId === this.props.grading!.length - 1,
      isRunning: this.props.isRunning,
      onClickNext: () =>
        history.push(gradingWorkspacePath + `/${(this.props.questionId + 1).toString()}`),
      onClickPrevious: () =>
        history.push(gradingWorkspacePath + `/${(this.props.questionId - 1).toString()}`),
      onClickSubmit: () => history.push(listingPath),
      sourceChapter: 2 // TODO dynamic library changing
    }
  }
}

export default GradingWorkspace
