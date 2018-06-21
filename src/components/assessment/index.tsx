import { Button, Card, Dialog, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import Workspace from '../../containers/workspace'
import { history } from '../../utils/history'
import { OwnProps as ControlBarOwnProps } from '../workspace/ControlBar'
import { SideContentTab } from '../workspace/side-content'
import { IAssessment } from './assessmentShape'

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
    const briefing = <Text> {this.props.assessment.longSummary} </Text>
    const overlay = (
      <Dialog className="mission-briefing" isOpen={this.state.showOverlay}>
        <Card>
          {briefing}
          <Button
            className="mission-briefing-button"
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => this.setState({ showOverlay: false })}
            text="Continue"
          />
        </Card>
      </Dialog>
    )
    const briefingTab: SideContentTab = {
      label: 'Briefing',
      icon: IconNames.BRIEFCASE,
      body: briefing
    }
    const currentLink = `/academy/${this.props.assessment.category.toLowerCase().concat('s')}/${this.props.assessment.id.toString()}`
    const controlBarOptions: ControlBarOwnProps = {
      hasChapterSelect: false,
      hasNextButton: this.props.questionId < this.props.assessment.questions.length - 1,
      onClickNext: () => history.push(currentLink + `/${(this.props.questionId + 1).toString()}`),
      hasPreviousButton: this.props.questionId > 0,
      onClickPrevious: () => history.push(currentLink + `/${(this.props.questionId - 1).toString()}`),
      hasSaveButton: true,
      hasShareButton: false
    }
    return (
      <div className="Assessment pt-dark">
        {overlay}
        <Workspace controlBarOptions={controlBarOptions} sideContentTabs={[briefingTab]} />
      </div>
    )
  }
}

export default Assessment
