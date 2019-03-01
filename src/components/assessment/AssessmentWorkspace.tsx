import { Button, Card, Dialog, NonIdealState, Spinner } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import { InterpreterOutput, IWorkspaceState } from '../../reducers/states'
import { beforeNow } from '../../utils/dateHelpers'
import { history } from '../../utils/history'
import { assessmentCategoryLink } from '../../utils/paramParseHelpers'
import Markdown from '../commons/Markdown'
import Workspace, { WorkspaceProps } from '../workspace'
import { ControlBarProps } from '../workspace/ControlBar'
import { SideContentProps } from '../workspace/side-content'
import ToneMatrix from '../workspace/side-content/ToneMatrix'
import {
  IAssessment,
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion,
  Library,
  QuestionTypes
} from './assessmentShape'
import GradingResult from './GradingResult'

export type AssessmentWorkspaceProps = DispatchProps & OwnProps & StateProps

export type StateProps = {
  activeTab: number
  assessment?: IAssessment
  editorValue: string | null
  editorWidth: string
  hasUnsavedChanges: boolean
  isRunning: boolean
  isDebugging: boolean
  enableDebugging: boolean
  output: InterpreterOutput[]
  replValue: string
  sideContentHeight?: number
  storedAssessmentId?: number
  storedQuestionId?: number
}

export type OwnProps = {
  assessmentId: number
  questionId: number
  notAttempted: boolean
  closeDate: string
}

export type DispatchProps = {
  handleAssessmentFetch: (assessmentId: number) => void
  handleBrowseHistoryDown: () => void
  handleBrowseHistoryUp: () => void
  handleChangeActiveTab: (activeTab: number) => void
  handleChapterSelect: (chapter: any, changeEvent: any) => void
  handleClearContext: (library: Library) => void
  handleEditorEval: () => void
  handleEditorValueChange: (val: string) => void
  handleEditorWidthChange: (widthChange: number) => void
  handleInterruptEval: () => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
  handleReplValueChange: (newValue: string) => void
  handleResetWorkspace: (options: Partial<IWorkspaceState>) => void
  handleSave: (id: number, answer: number | string) => void
  handleSideContentHeightChange: (heightChange: number) => void
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => void
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void
  handleDebuggerPause: () => void
  handleDebuggerResume: () => void
  handleDebuggerReset: () => void
}

class AssessmentWorkspace extends React.Component<
  AssessmentWorkspaceProps,
  { showOverlay: boolean }
> {
  public constructor(props: AssessmentWorkspaceProps) {
    super(props)
    this.state = {
      showOverlay: false
    }
  }

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  public componentDidMount() {
    this.props.handleAssessmentFetch(this.props.assessmentId)
    if (this.props.questionId === 0 && this.props.notAttempted) {
      this.setState({ showOverlay: true })
    }
  }

  /**
   * Once there is an update (due to the assessment being fetched), check
   * if a workspace reset is needed.
   */
  public componentDidUpdate() {
    this.checkWorkspaceReset(this.props)
  }

  public render() {
    if (this.props.assessment === undefined || this.props.assessment.questions.length === 0) {
      return (
        <NonIdealState
          className="WorkspaceParent pt-dark"
          description="Getting mission ready..."
          visual={<Spinner large={true} />}
        />
      )
    }
    const overlay = (
      <Dialog className="assessment-briefing" isOpen={this.state.showOverlay}>
        <Card>
          <Markdown content={this.props.assessment.longSummary} />
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
    const editorValue =
      question.type === QuestionTypes.programming
        ? question.answer !== null
          ? ((question as IProgrammingQuestion).answer as string)
          : (question as IProgrammingQuestion).solutionTemplate
        : null
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(this.props, questionId),
      editorProps:
        question.type === QuestionTypes.programming
          ? {
              editorValue: editorValue!,
              handleEditorEval: this.props.handleEditorEval,
              handleEditorValueChange: this.props.handleEditorValueChange,
              handleUpdateHasUnsavedChanges: this.props.handleUpdateHasUnsavedChanges
            }
          : undefined,
      editorWidth: this.props.editorWidth,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      hasUnsavedChanges: this.props.hasUnsavedChanges,
      mcqProps: {
        mcq: question as IMCQQuestion,
        handleMCQSubmit: (option: number) =>
          this.props.handleSave(this.props.assessment!.questions[questionId].id, option)
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
      <div className="WorkspaceParent pt-dark">
        {overlay}
        <Workspace {...workspaceProps} />
      </div>
    )
  }

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  private checkWorkspaceReset(props: AssessmentWorkspaceProps) {
    /* Don't reset workspace if assessment not fetched yet. */
    if (this.props.assessment === undefined) {
      return
    }

    /* Reset assessment if it has changed.*/
    const assessmentId = this.props.assessmentId
    const questionId = this.props.questionId

    if (
      this.props.storedAssessmentId !== assessmentId ||
      this.props.storedQuestionId !== questionId
    ) {
      const question = this.props.assessment.questions[questionId]
      const editorValue =
        question.type === QuestionTypes.programming
          ? question.answer !== null
            ? ((question as IProgrammingQuestion).answer as string)
            : (question as IProgrammingQuestion).solutionTemplate
          : null
      this.props.handleUpdateCurrentAssessmentId(assessmentId, questionId)
      this.props.handleResetWorkspace({ editorValue })
      this.props.handleClearContext(question.library)
      this.props.handleUpdateHasUnsavedChanges(false)
      if (editorValue) {
        this.props.handleEditorValueChange(editorValue)
      }
    }
  }

  /** Pre-condition: IAssessment has been loaded */
  private sideContentProps: (p: AssessmentWorkspaceProps, q: number) => SideContentProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const tabs = [
      {
        label: `Task ${questionId + 1}`,
        icon: IconNames.NINJA,
        body: <Markdown content={props.assessment!.questions[questionId].content} />
      },
      {
        label: `${props.assessment!.category} Briefing`,
        icon: IconNames.BRIEFCASE,
        body: <Markdown content={props.assessment!.longSummary} />
      }
    ]
    const isGraded = props.assessment!.questions[questionId].grader !== null
    if (isGraded) {
      tabs.push({
        label: `Grading`,
        icon: IconNames.TICK,
        body: (
          <GradingResult
            comment={props.assessment!.questions[questionId].comment}
            graderName={props.assessment!.questions[questionId].grader.name}
            gradedAt={props.assessment!.questions[questionId].gradedAt}
            xp={props.assessment!.questions[questionId].xp}
            grade={props.assessment!.questions[questionId].grade}
            maxGrade={props.assessment!.questions[questionId].maxGrade}
            maxXp={props.assessment!.questions[questionId].maxXp}
          />
        )
      })
    }

    const functionsAttached = props.assessment!.questions[questionId].library.external.symbols
    if (functionsAttached.includes('get_matrix')) {
      tabs.push({
        label: `Tone Matrix`,
        icon: IconNames.GRID_VIEW,
        body: <ToneMatrix />
      })
    }
    return {
      activeTab: props.activeTab,
      handleChangeActiveTab: props.handleChangeActiveTab,
      tabs
    }
  }

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
      handleReplValueChange: this.props.handleReplValueChange,
      handleDebuggerPause: this.props.handleDebuggerPause,
      handleDebuggerResume: this.props.handleDebuggerResume,
      handleDebuggerReset: this.props.handleDebuggerReset,
      hasChapterSelect: false,
      hasSaveButton:
        !beforeNow(this.props.closeDate) &&
        this.props.assessment!.questions[questionId].type !== QuestionTypes.mcq,
      hasShareButton: false,
      isRunning: this.props.isRunning,
      isDebugging: this.props.isDebugging,
      enableDebugging: this.props.enableDebugging,
      onClickNext: () => history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`),
      onClickPrevious: () =>
        history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`),
      onClickReturn: () => history.push(listingPath),
      onClickSave: () =>
        this.props.handleSave(
          this.props.assessment!.questions[questionId].id,
          this.props.editorValue!
        ),
      questionProgress: [questionId + 1, this.props.assessment!.questions.length],
      sourceChapter: this.props.assessment!.questions[questionId].library.chapter
    }
  }
}

export default AssessmentWorkspace
