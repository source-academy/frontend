import { Button, Card, Icon, Intent, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { NavLink } from 'react-router-dom'

import AssessmentContainer from '../../containers/AssessmentContainer'
import { OwnProps as AssessmentProps } from '../assessment'
import { IAssessmentOverview } from '../assessment/assessmentShape'
import ContentDisplay, { IContentDisplayProps } from '../commons/ContentDisplay'

export interface IAssessmentParams {
  assessmentId?: string
}

export interface IAssessmentListingProps extends RouteComponentProps<IAssessmentParams> {
  assessmentOverviews?: IAssessmentOverview[]
  handleAssessmentOverviewFetch: () => void
}

export type StateProps = Pick<IAssessmentListingProps, 'assessmentOverviews'>
export type DispatchProps = Pick<IAssessmentListingProps, 'handleAssessmentOverviewFetch'>

class AssessmentListing extends React.Component<IAssessmentListingProps, {}> {
  public render() {
    // make assessmentId a number
    let assessmentIdParam: number | null =
      this.props.match.params.assessmentId === undefined
        ? NaN
        : parseInt(this.props.match.params.assessmentId, 10)
    // set as null if the parsing failed
    assessmentIdParam = Number.isInteger(assessmentIdParam) ? assessmentIdParam : null

    // if there is no assessmentId specified, Render only information.
    if (assessmentIdParam === null) {
      const props: IContentDisplayProps = {
        display: <AssessmentOverviewCard assessmentOverviews={this.props.assessmentOverviews} />,
        loadContentDispatch: this.props.handleAssessmentOverviewFetch
      }
      return (
        <div className="Missions">
          <ContentDisplay {...props} />
        </div>
      )
    } else {
      const props: AssessmentProps = {
        assessmentId: assessmentIdParam
      }
      return <AssessmentContainer {...props} />
    }
  }
}

interface IAssessmentOverviewCardProps {
  assessmentOverviews?: IAssessmentOverview[]
}

export const AssessmentOverviewCard: React.SFC<IAssessmentOverviewCardProps> = props => {
  if (props.assessmentOverviews === undefined) {
    return <NonIdealState description="Fetching assessment..." visual={<Spinner />} />
  } else if (props.assessmentOverviews.length === 0) {
    return <NonIdealState title="There are no assessments." visual={IconNames.FLAME} />
  }
  const cards = props.assessmentOverviews.map((mission, index) => (
    <div key={index}>
      <Card className="row mission-info">
        <div className="col-xs-3 mission-info-picture">PICTURE</div>
        <div className="col-xs-9 mission-info-text">
          <div className="row mission-info-title">
            <h4>{mission.title}</h4>
          </div>
          <div className="row mission-info-order">
            <h6>Mission 0 : 123123 XP (hardcoded)</h6>
          </div>
          <div className="row mission-info-description">
            <p className="col-xs-12">{mission.shortSummary}</p>
          </div>
          <div className="row between-xs middle-xs mission-info-controls">
            <div className="col-xs-8 mission-info-due-date-parent">
              <Text className="mission-info-due-date">
                <Icon className="mission-info-due-icon" iconSize={14} icon={IconNames.TIME} />
                Due: 12/12/12
              </Text>
            </div>
            <div className="col-xs">
              <NavLink to={`/academy/missions/${mission.id.toString()}`}>
                <Button
                  className="mission-info-skip-button"
                  minimal={true}
                  intent={Intent.PRIMARY}
                  icon={IconNames.FLAME}
                >
                  Skip Story & Attempt
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </Card>
    </div>
  ))
  return <>{cards}</>
}

export default AssessmentListing
