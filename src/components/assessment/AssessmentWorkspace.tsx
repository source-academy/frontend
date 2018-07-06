import { Button, Card, Dialog, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import { InterpreterOutput } from '../../reducers/states'
import { history } from '../../utils/history'
import { assessmentCategoryLink } from '../../utils/paramParseHelpers'
import Workspace, { WorkspaceProps } from '../workspace'
import { ControlBarProps } from '../workspace/ControlBar'
import { SideContentProps } from '../workspace/side-content'
import {
  IAssessment,
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion,
  QuestionTypes
} from './assessmentShape'

export type AssessmentWorkspaceProps = DispatchProps & OwnProps & StateProps

export type StateProps = {
  activeTab: number
  assessment?: IAssessment
  editorValue?: string
  editorWidth: string
  isRunning: boolean
  output: InterpreterOutput[]
  replValue: string
  sideContentHeight?: number
}

export type OwnProps = {
  assessmentId: number
  questionId: number
}

export type DispatchProps = {
  handleAssessmentFetch: (assessmentId: number) => void
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

class AssessmentWorkspace extends React.Component<
  AssessmentWorkspaceProps,
  { showOverlay: boolean }
> {
  public state = { showOverlay: false }

  public componentWillMount() {
    this.props.handleAssessmentFetch(this.props.assessmentId)
    if (this.props.questionId === 0) {
      this.setState({ showOverlay: true })
    }
  }

  public render() {
    if (this.props.assessment === undefined || this.props.assessment.questions.length === 0) {
      return (
        <NonIdealState
          className="AssessmentWorkspace pt-dark"
          description="Getting mission ready..."
          visual={<Spinner large={true} />}
        />
      )
    }
    const overlay = (
      <Dialog className="assessment-briefing" isOpen={this.state.showOverlay}>
        <Card>
          <Text> {this.props.assessment.longSummary} </Text>
          <Button
            className="assessment-briefing-button"
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => this.setState({ showOverlay: false })}
            text="Continue"
          />
        </Card>
      </Dialog>
    )
    /* If questionId is out of bounds, set it to the max. */
    const questionId =
      this.props.questionId >= this.props.assessment.questions.length
        ? this.props.assessment.questions.length - 1
        : this.props.questionId
    const question: IQuestion = this.props.assessment.questions[questionId]
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(this.props, questionId),
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
      sideContentProps: this.sideContentProps(this.props, questionId),
      replProps: {
        output: this.props.output,
        replValue: this.props.replValue,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange
      }
    }
    return (
      <div className="AssessmentWorkspace pt-dark">
        {overlay}
        <Workspace {...workspaceProps} />
      </div>
    )
  }

  /** Pre-condition: IAssessment has been loaded */
  private sideContentProps: (p: AssessmentWorkspaceProps, q: number) => SideContentProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => ({
    activeTab: props.activeTab,
    handleChangeActiveTab: props.handleChangeActiveTab,
    tabs: [
      {
        label: `Task ${questionId}`,
        icon: IconNames.NINJA,
        body: <Text> {props.assessment!.questions[questionId].content} </Text>
      },
      {
        label: `${props.assessment!.category} Briefing`,
        icon: IconNames.BRIEFCASE,
        body: <Text> {props.assessment!.longSummary} </Text>
      }
    ]
  })

  /** Pre-condition: IAssessment has been loaded */
  private controlBarProps: (p: AssessmentWorkspaceProps, q: number) => ControlBarProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const listingPath = `/academy/${assessmentCategoryLink(this.props.assessment!.category)}`
    const assessmentWorkspacePath = listingPath + `/${this.props.assessment!.id.toString()}`
    return {
      handleChapterSelect: this.props.handleChapterSelect,
      handleEditorEval: this.props.handleEditorEval,
      handleInterruptEval: this.props.handleInterruptEval,
      handleReplEval: this.props.handleReplEval,
      handleReplOutputClear: this.props.handleReplOutputClear,
      hasChapterSelect: false,
      hasNextButton: questionId < this.props.assessment!.questions.length - 1,
      hasPreviousButton: questionId > 0,
      hasSaveButton: true,
      hasShareButton: false,
      hasSubmitButton: questionId === this.props.assessment!.questions.length - 1,
      isRunning: this.props.isRunning,
      onClickNext: () => history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`),
      onClickPrevious: () =>
        history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`),
      onClickSubmit: () => history.push(listingPath),
      sourceChapter: 2 // TODO dynamic library changing
    }
  }
}

export default AssessmentWorkspace
