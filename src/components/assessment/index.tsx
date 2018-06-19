import { Button, Card, Dialog, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import Workspace from '../../containers/workspace'
import { OwnProps as ControlBarOwnProps } from '../workspace/ControlBar'
import { SideContentTab } from '../workspace/side-content'
import { IAssessment } from './assessmentShape'

export type AssessmentProps = DispatchProps & OwnProps & StateProps

export type StateProps = {
  assessment?: IAssessment
}

export type OwnProps = { missionId: number }

export type DispatchProps = {
  handleAssessmentFetch: (missionId: number) => void
}

class Assessment extends React.Component<AssessmentProps, { showOverlay: boolean }> {
  public state = { showOverlay: true }

  public render() {
    if (this.props.assessment === undefined) {
      this.props.handleAssessmentFetch(this.props.missionId)
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
    const controlBarOptions: ControlBarOwnProps = {
      hasChapterSelect: false,
      hasNextButton: true,
      hasPreviousButton: true,
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
