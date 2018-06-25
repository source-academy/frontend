import { Button, Card, Dialog, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import Workspace, { WorkspaceProps } from '../workspace'
import { history } from '../../utils/history'
import { assessmentCategoryLink } from '../../utils/paramParseHelpers'
import { ControlBarProps } from '../workspace/ControlBar'
import { SideContentProps } from '../workspace/side-content'
import { IAssessment, IMCQQuestion, IProgrammingQuestion } from './assessmentShape'

export type AssessmentProps = DispatchProps & OwnProps & StateProps

export type StateProps = {
  assessment?: IAssessment
}

export type OwnProps = {
  assessmentId: number
  questionId: number
}

export type DispatchProps = {
  handleAssessmentFetch: (assessmentId: number) => void
}

class Assessment extends React.Component<AssessmentProps, { showOverlay: boolean }> {
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
          className="Assessment pt-dark"
          description="Getting mission ready..."
          visual={<Spinner large={true} />}
        />
      )
    }
    const overlay = (
      <Dialog className="mission-briefing" isOpen={this.state.showOverlay}>
        <Card>
          <Text> {this.props.assessment.longSummary} </Text>
          <Button
            className="mission-briefing-button"
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => this.setState({ showOverlay: false })}
            text="Continue"
          />
        </Card>
      </Dialog>
    )
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(this.props),
      sideContentProps: this.sideContentProps(this.props),
      editorProps: {
        editorValue: (this.props.assessment.questions[this.props.questionId] as IProgrammingQuestion).solutionTemplate,
        handleEditorEval: () => {}, // TODO 
        handleEditorValueChange: (str: string) => {} // TODO
      },
      editorWidth: "0", // TODO
      handleEditorWidthChange: (n: number) => {}, // TODO 
      handleSideContentHeightChange: (h: number) => {}, //TODO
      mcq: this.props.assessment.questions[this.props.questionId] as IMCQQuestion,
      replProps: { //TODO
        output: [],
        replValue: "",
        handleReplEval: () => {},
        handleReplValueChange: (code: string) => {}
      }
    }
    return (
      <div className="Assessment pt-dark">
        {overlay}
        <Workspace {...workspaceProps} />
      </div>
    )
  }

  /** Pre-condition: IAssessment has been loaded */
  private sideContentProps: (p: AssessmentProps) => SideContentProps = (props: AssessmentProps) => ({
    tabs: [
      {
        label: `Task ${props.questionId}`,
        icon: IconNames.NINJA,
        body: (<Text> {props.assessment!.questions[props.questionId].content} </Text>)
      },
      {
        label: `${props.assessment!.category} Briefing`,
        icon: IconNames.BRIEFCASE,
        body: (<Text> {props.assessment!.longSummary} </Text>)
      }
    ],
    activeTab: 0,
    handleChangeActiveTab: (aT: number) => {}

  })
  
  /** Pre-condition: IAssessment has been loaded */
  private controlBarProps: (p: AssessmentProps) => ControlBarProps = (props: AssessmentProps) => {
    const listingPath = `/academy/${assessmentCategoryLink(this.props.assessment!.category)}`
    const assessmentPath = listingPath + `/${this.props.assessment!.id.toString()}`
    return {
      hasChapterSelect: false,
      hasNextButton: this.props.questionId < this.props.assessment!.questions.length - 1,
      hasPreviousButton: this.props.questionId > 0,
      hasSubmitButton: this.props.questionId === this.props.assessment!.questions.length - 1,
      onClickNext: () =>
        history.push(assessmentPath + `/${(this.props.questionId + 1).toString()}`),
      onClickPrevious: () =>
        history.push(assessmentPath + `/${(this.props.questionId - 1).toString()}`),
      onClickSubmit: () => history.push(listingPath),
      hasSaveButton: true,
      hasShareButton: false,
      handleChapterSelect: (i: any, e: any) => {}, // TODO,
      handleEditorEval: () => {}, // TODO
      handleReplEval: () => {}, // TODO
      handleReplOutputClear: () => {}, // TODO
      handleInterruptEval: () => {}, // TODO 
      isRunning: false, // TODO 
      sourceChapter: 2, // TODO 
    }
  }
}

export default Assessment
