import { Button, Card, Icon, Intent, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { NavLink } from 'react-router-dom'

import AssessmentWorkspaceContainer from '../../containers/assessment/AssessmentWorkspaceContainer'
import { beforeNow } from '../../utils/dateHelpers'
import { assessmentCategoryLink, stringParamToInt } from '../../utils/paramParseHelpers'
import { AssessmentCategory, IAssessmentOverview } from '../assessment/assessmentShape'
import { OwnProps as AssessmentProps } from '../assessment/AssessmentWorkspace'
import ContentDisplay, { IContentDisplayProps } from '../commons/ContentDisplay'

const DEFAULT_QUESTION_ID: number = 0 

export interface IAssessmentWorkspaceParams {
  assessmentId?: string
  questionId?: string
}

export interface IAssessmentProps
  extends IDispatchProps,
    IOwnProps,
    RouteComponentProps<IAssessmentWorkspaceParams>,
    IStateProps {}

export interface IDispatchProps {
  handleAssessmentOverviewFetch: () => void
  handleResetAssessmentWorkspace: () => void
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => void
}

export interface IOwnProps {
  assessmentCategory: AssessmentCategory
}

export interface IStateProps {
  assessmentOverviews?: IAssessmentOverview[]
  storedAssessmentId?: number
  storedQuestionId?: number
}

class Assessment extends React.Component<IAssessmentProps, {}> {
  /**
   * If the current AssessmentId/QuestionId has changed, update it
   * in the store and reset the workspace.
   */
  public componentWillMount() {
    const assessmentId = stringParamToInt(this.props.match.params.assessmentId)
    if (assessmentId === null) {
      return
    }
    const questionId = stringParamToInt(this.props.match.params.questionId)!

    if (
      this.props.storedAssessmentId !== assessmentId ||
      this.props.storedQuestionId !== questionId
    ) {
      this.props.handleUpdateCurrentAssessmentId(assessmentId, questionId)
      this.props.handleResetAssessmentWorkspace()
    }
  }

  public render() {
    const assessmentId: number | null = stringParamToInt(this.props.match.params.assessmentId)
    const questionId: number = stringParamToInt(this.props.match.params.questionId) || DEFAULT_QUESTION_ID
    if (assessmentId !== null) {
      const assessmentProps: AssessmentProps = {
        assessmentId,
        questionId
      }
      return <AssessmentWorkspaceContainer {...assessmentProps} />
    }

    // if there is no assessmentId specified, Render only information.
    const displayProps: IContentDisplayProps = {
      display: (
        <AssessmentOverviewCard
          assessmentOverviews={this.props.assessmentOverviews}
        />
      ),
      loadContentDispatch: this.props.handleAssessmentOverviewFetch
    }
    return (
      <div className="Assessment">
        <ContentDisplay {...displayProps} />
      </div>
    )
  }
}


export const AssessmentOverviewCard: React.SFC<{
  assessmentOverviews?: IAssessmentOverview[]
}> = props => {
  if (props.assessmentOverviews === undefined) {
    return <NonIdealState description="Fetching assessment..." visual={<Spinner />} />
  } else if (props.assessmentOverviews.length === DEFAULT_QUESTION_ID) {
    return <NonIdealState title="There are no assessments." visual={IconNames.FLAME} />
  }
  const openCards = props.assessmentOverviews
    .filter((a) => !beforeNow(a.closeAt))
    .map((overview, index) => makeOverviewCard(overview, index))
  const closedCards = props.assessmentOverviews
    .filter((a) => beforeNow(a.closeAt))
    .map((overview, index) => makeOverviewCard(overview, index))
  return <>{openCards} {closedCards} </>
}

/**
 * Create a series of cards to display IAssessmentOverviews.
 * @param {IAssessmentOverview} overview the assessment overview to display
 * @param {number} index a unique number for this card (required for sequential rendering).
 *   See {@link https://reactjs.org/docs/lists-and-keys.html#keys}
 */
const makeOverviewCard = (overview: IAssessmentOverview, index: number) => (
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
                )}/${overview.id.toString()}/${DEFAULT_QUESTION_ID}`}
              >
                <Button
                  className="listing-skip-button"
                  minimal={true}
                  intent={Intent.PRIMARY}
                  icon={IconNames.FLAME}
                >
                  {'Skip Story & Attempt'}
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

export default Assessment
