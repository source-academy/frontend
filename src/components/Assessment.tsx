import { Button, Dialog, NonIdealState, Spinner } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import Workspace from '../containers/workspace'
import { SideContentTab } from './workspace/side-content'

export type AssessmentInfo = {
  longSummary: string
  dueDate: string
  studentBriefed: boolean
}

export type StateProps = {
  missionId: number
  assessmentInfo?: AssessmentInfo
}

export type DispatchProps = {
  handleAssessmentInfoFetch: (missionId: number) => void
}

export type AssessmentProps = StateProps & DispatchProps

class Assessment extends React.Component<AssessmentProps, { showOverlay: boolean }> {
  public state = { showOverlay: true }

  public render() {
    if (this.props.assessmentInfo === undefined) {
      this.props.handleAssessmentInfoFetch(this.props.missionId)
      return <NonIdealState description="Getting mission ready..." visual={<Spinner />} />
    }
    const briefing = <> ({this.props.assessmentInfo.longSummary}) </>
    const overlay = (
      <Dialog
        className="mission-briefing"
        isOpen={this.state.showOverlay && !this.props.assessmentInfo.studentBriefed}
      >
        <>
          {briefing}
          <Button
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => this.setState({ showOverlay: false })}
            text="Primary"
          />
        </>
      </Dialog>
    )
    const briefingTab: SideContentTab = {
      label: 'Briefing',
      icon: IconNames.BRIEFCASE,
      body: briefing
    }
    return (
      <>
        {overlay}
        <Workspace sideContentTabs={[briefingTab]} />
      </>
    )
  }
}

export default Assessment
