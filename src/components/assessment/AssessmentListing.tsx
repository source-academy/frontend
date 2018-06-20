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
        <div className="AssessmentListing">
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
  const cards = props.assessmentOverviews.map((overview, index) => (
    <div key={index}>
      <Card className="row listing">
        <div className="col-xs-3 listing-picture">PICTURE</div>
        <div className="col-xs-9 listing-text">
          <div className="row listing-title">
            <h4>{overview.title}</h4>
          </div>
          <div className="row listing-order">
            <h6>Mission 0 : 123123 XP (hardcoded)</h6>
          </div>
          <div className="row listing-description">
            <p className="col-xs-12">{overview.shortSummary}</p>
          </div>
          <div className="row between-xs middle-xs listing-controls">
            <div className="col-xs-8 listing-due-date-parent">
              <Text className="listing-due-date">
                <Icon className="listing-due-icon" iconSize={14} icon={IconNames.TIME} />
                Due: 12/12/12
              </Text>
            </div>
            <div className="col-xs">
              <NavLink to={`/academy/missions/${overview.id.toString()}`}>
                <Button
                  className="listing-skip-button"
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
