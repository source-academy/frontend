import { NonIdealState, Overlay, Spinner } from '@blueprintjs/core'
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

export type OwnProps = {
  missionId: number
}

export type DispatchProps = {
  hanldeBriefStudent: () => void
  handleAssessmentInfoFetch: () => void
}

export type AssessmentProps = StateProps & DispatchProps

class Assessment extends React.Component<AssessmentProps, {}> {
  public render() {
    if (this.props.assessmentInfo === undefined) {
      this.props.handleAssessmentInfoFetch()
      return <NonIdealState description="Getting mission ready..." visual={<Spinner />} />
    }
    const briefing = <> ({this.props.assessmentInfo.longSummary}) </>
    const overlay = (
      <Overlay
        className="mission-briefing"
        isOpen={this.props.assessmentInfo.studentBriefed}
        onClose={this.props.hanldeBriefStudent}
      >
        {briefing}
      </Overlay>
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
