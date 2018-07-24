import { NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import { ExternalLibraryName } from '../../../components/assessment/assessmentShape'
import GradingEditor from '../../../containers/academy/grading/GradingEditorContainer'
import { InterpreterOutput, IWorkspaceState } from '../../../reducers/states'
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
  editorValue: string | null
  editorWidth: string
  isRunning: boolean
  output: InterpreterOutput[]
  replValue: string
  sideContentHeight?: number
  storedSubmissionId?: number
  storedQuestionId?: number
}

export type OwnProps = {
  submissionId: number
  questionId: number
}

export type DispatchProps = {
  handleBrowseHistoryDown: () => void
  handleBrowseHistoryUp: () => void
  handleChangeActiveTab: (activeTab: number) => void
  handleChapterSelect: (chapter: any, changeEvent: any) => void
  handleClearContext: (
    chapter: number,
    externals: string[],
    externalLibraryName: ExternalLibraryName
  ) => void
  handleEditorEval: () => void
  handleEditorValueChange: (val: string) => void
  handleEditorWidthChange: (widthChange: number) => void
  handleGradingFetch: (submissionId: number) => void
  handleInterruptEval: () => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
  handleReplValueChange: (newValue: string) => void
  handleResetWorkspace: (options: Partial<IWorkspaceState>) => void
  handleSideContentHeightChange: (heightChange: number) => void
  handleUpdateCurrentSubmissionId: (submissionId: number, questionId: number) => void
}

class GradingWorkspace extends React.Component<GradingWorkspaceProps> {
  /**
   * First, check for a need to reset the workspace,
   * then fetch the grading. This works because a change in
   * submissionId or questionId results in a navigation, causing
   * this component to be mounted again. The handleGradingFetch
   * occurs after the call to checkWorkspaceReset finishes.
   */
  public componentDidMount() {
    this.props.handleGradingFetch(this.props.submissionId)
  }

  /**
   * After the Grading is fetched, there is a check for wether the
   * workspace needs to be udpated (a change in submissionId or questionId)
   */
  public componentDidUpdate() {
    this.checkWorkspaceReset(this.props)
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

    /* If questionId is out of bounds, set it to the max. */
    const questionId =
      this.props.questionId >= this.props.grading.length
        ? this.props.grading.length - 1
        : this.props.questionId
    /* Get the question to be graded */
    const question = this.props.grading[questionId].question as IQuestion
    const editorValue =
      question.type === QuestionTypes.programming
        ? question.answer !== null
          ? ((question as IProgrammingQuestion).answer as string)
          : (question as IProgrammingQuestion).solutionTemplate
        : null
    const chosenMCQAnswer =
      question.type === QuestionTypes.mcq && question.answer !== null
        ? ((question as IMCQQuestion).answer as number)
        : null
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(this.props, questionId),
      editorProps:
        question.type === QuestionTypes.programming
          ? {
              editorValue: editorValue!,
              handleEditorEval: this.props.handleEditorEval,
              handleEditorValueChange: this.props.handleEditorValueChange
            }
          : undefined,
      editorWidth: this.props.editorWidth,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      mcqProps: {
        chosenOption: chosenMCQAnswer,
        mcq: question as IMCQQuestion,
        handleMCQSubmit: (i: number) => {}
      },
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: this.sideContentProps(this.props, questionId),
      replProps: {
        handleBrowseHistoryDown: this.props.handleBrowseHistoryDown,
        handleBrowseHistoryUp: this.props.handleBrowseHistoryUp,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange,
        output: this.props.output,
        replValue: this.props.replValue
      }
    }
    return (
      <div className="AssessmentWorkspace pt-dark">
        <Workspace {...workspaceProps} />
      </div>
    )
  }

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  private checkWorkspaceReset(props: GradingWorkspaceProps) {
    /* Don't reset workspace if grading not fetched yet. */
    if (this.props.grading === undefined) {
      return
    }

    /* Reset grading if it has changed.*/
    const submissionId = this.props.submissionId
    const questionId = this.props.questionId

    if (
      this.props.storedSubmissionId !== submissionId ||
      this.props.storedQuestionId !== questionId
    ) {
      const question = this.props.grading[questionId].question as IQuestion
      const chapter = question.library.chapter
      const externalName = question.library.externalLibraryName
      const externals = question.library.externals
      const editorValue =
        question.type === QuestionTypes.programming
          ? question.answer !== null
            ? ((question as IProgrammingQuestion).answer as string)
            : (question as IProgrammingQuestion).solutionTemplate
          : null
      this.props.handleUpdateCurrentSubmissionId(submissionId, questionId)
      this.props.handleResetWorkspace({editorValue})
      this.props.handleClearContext(chapter, externals, externalName)
    }
  }

  /** Pre-condition: Grading has been loaded */
  private sideContentProps: (p: GradingWorkspaceProps, q: number) => SideContentProps = (
    props: GradingWorkspaceProps,
    questionId: number
  ) => ({
    activeTab: props.activeTab,
    handleChangeActiveTab: props.handleChangeActiveTab,
    tabs: [
      {
        label: `Grading: Question ${questionId}`,
        icon: IconNames.TICK,
        /* Render an editor with the xp given to the current question. */
        body: <GradingEditor maximumXP={props.grading![questionId].maximumXP} />
      },
      {
        label: `Task ${questionId}`,
        icon: IconNames.NINJA,
        body: <Text> {props.grading![questionId].question.content} </Text>
      }
    ]
  })

  /** Pre-condition: Grading has been loaded */
  private controlBarProps: (p: GradingWorkspaceProps, q: number) => ControlBarProps = (
    props: GradingWorkspaceProps,
    questionId: number
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
      hasDoneButton: questionId === this.props.grading!.length - 1,
      hasNextButton: questionId < this.props.grading!.length - 1,
      hasPreviousButton: questionId > 0,
      hasSaveButton: false,
      hasShareButton: false,
      isRunning: this.props.isRunning,
      onClickDone: () => history.push(listingPath),
      onClickNext: () => history.push(gradingWorkspacePath + `/${(questionId + 1).toString()}`),
      onClickPrevious: () => history.push(gradingWorkspacePath + `/${(questionId - 1).toString()}`),
      sourceChapter: this.props.grading![questionId].question.library.chapter
    }
  }
}

export default GradingWorkspace
