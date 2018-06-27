import { Button, Card, Icon, Intent, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { NavLink } from 'react-router-dom'

import AssessmentContainer from '../../containers/assessment'
import { assessmentCategoryLink, stringParamToInt } from '../../utils/paramParseHelpers'
import { OwnProps as AssessmentProps } from '../assessment'
import { AssessmentCategory } from '../assessment/assessmentShape'
import { IAssessmentOverview } from '../assessment/assessmentShape'
import ContentDisplay, { IContentDisplayProps } from '../commons/ContentDisplay'

export interface IAssessmentParams {
  assessmentId?: string
  questionId?: string
}

export interface IAssessmentListingProps extends IDispatchProps, IOwnProps, RouteComponentProps<IAssessmentParams>, IStateProps {}

export interface IDispatchProps {
  handleAssessmentOverviewFetch: () => void,
  handleResetAssessmentWorkspace:() => void,
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => void
}

export interface IOwnProps {
  assessmentCategory: AssessmentCategory
}

export interface IStateProps {
  assessmentOverviews?: IAssessmentOverview[],
  storedAssessmentId?: number,
  storedQuestionId?: number
}

class AssessmentListing extends React.Component<IAssessmentListingProps, {}> {
  public componentWillMount() {
    const assessmentId = stringParamToInt(this.props.match.params.assessmentId)
    const questionId = stringParamToInt(this.props.match.params.questionId)
    if (assessmentId === null || questionId === null ) {
      return
    }

    if (this.props.storedAssessmentId !== assessmentId || this.props.storedQuestionId !== questionId) {
      this.props.handleUpdateCurrentAssessmentId(assessmentId, questionId)
      this.props.handleResetAssessmentWorkspace()
    } 
  }

  public render() {
    const assessmentIdParam: number | null = stringParamToInt(this.props.match.params.assessmentId)
    // default questionId is 0 (the first question)
    const questionIdParam: number = stringParamToInt(this.props.match.params.questionId) || 0

    // if there is no assessmentId specified, Render only information.
    if (assessmentIdParam === null) {
      const props: IContentDisplayProps = {
        display: (
          <AssessmentOverviewCard
            assessmentOverviews={this.props.assessmentOverviews}
            questionId={questionIdParam}
          />
        ),
        loadContentDispatch: this.props.handleAssessmentOverviewFetch
      }
      return (
        <div className="AssessmentListing">
          <ContentDisplay {...props} />
        </div>
      )
    } else {
      const props: AssessmentProps = {
        assessmentId: assessmentIdParam,
        questionId: questionIdParam
      }
      return <AssessmentContainer {...props} />
    }
  }
}

interface IAssessmentOverviewCardProps {
  assessmentOverviews?: IAssessmentOverview[]
  questionId: number
}

export const AssessmentOverviewCard: React.SFC<IAssessmentOverviewCardProps> = props => {
  const questionId = props.questionId === undefined ? 0 : props.questionId
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
              <NavLink
                to={`/academy/${assessmentCategoryLink(
                  overview.category
                )}/${overview.id.toString()}/${questionId.toString()}`}
              >
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
