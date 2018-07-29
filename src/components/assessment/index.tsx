import {
  Button,
  Card,
  Collapse,
  Icon,
  Intent,
  NonIdealState,
  Spinner,
  Text
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { NavLink } from 'react-router-dom'

import AssessmentWorkspaceContainer from '../../containers/assessment/AssessmentWorkspaceContainer'
import { beforeNow, getPrettyDate } from '../../utils/dateHelpers'
import { assessmentCategoryLink, stringParamToInt } from '../../utils/paramParseHelpers'
import { AssessmentCategory, IAssessmentOverview } from '../assessment/assessmentShape'
import { OwnProps as AssessmentProps } from '../assessment/AssessmentWorkspace'
import { controlButton } from '../commons'
import ContentDisplay from '../commons/ContentDisplay'

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
}

export interface IOwnProps {
  assessmentCategory: AssessmentCategory
}

export interface IStateProps {
  assessmentOverviews?: IAssessmentOverview[]
}

type State = {
  showOpenAssessments: boolean
  showClosedAssessments: boolean
}

class Assessment extends React.Component<IAssessmentProps, State> {
  /**
   * Initialize state
   */
  public constructor(props: IAssessmentProps) {
    super(props)
    this.state = {
      showOpenAssessments: true,
      showClosedAssessments: false
    }
  }

  public render() {
    const assessmentId: number | null = stringParamToInt(this.props.match.params.assessmentId)
    const questionId: number =
      stringParamToInt(this.props.match.params.questionId) || DEFAULT_QUESTION_ID

    /**
     * If there is an assessment to render, create a workspace. The assessment
     * overviews must still be loaded for this, to send the due date.
     */
    if (assessmentId !== null && this.props.assessmentOverviews !== undefined) {
      const assessmentProps: AssessmentProps = {
        assessmentId,
        questionId,
        // get the closeDate of the assessment
        closeDate: this.props.assessmentOverviews.filter(a => a.id === assessmentId)[0].closeAt
      }
      return <AssessmentWorkspaceContainer {...assessmentProps} />
    }

    // The item to be displayed in the ContentDisplay
    let display: JSX.Element
    if (this.props.assessmentOverviews === undefined) {
      display = <NonIdealState description="Fetching assessment..." visual={<Spinner />} />
    } else if (this.props.assessmentOverviews.length === 0) {
      display = <NonIdealState title="There are no assessments." visual={IconNames.FLAME} />
    } else {
      const openCards = this.props.assessmentOverviews
        .filter(a => !beforeNow(a.closeAt))
        .map((overview, index) => makeOverviewCard(overview, index))
      const closedCards = this.props.assessmentOverviews
        .filter(a => beforeNow(a.closeAt))
        .map((overview, index) => makeOverviewCard(overview, index))
      const openCardsCollapsible =
        openCards.length > 0 ? (
          <>
            {collapseButton('Due soon', this.state.showOpenAssessments, this.toggleOpenAssessments)}
            <Collapse isOpen={this.state.showOpenAssessments}>{openCards}</Collapse>
          </>
        ) : null
      const closedCardsCollapsible =
        closedCards.length > 0 ? (
          <>
            {collapseButton(
              'Closed',
              this.state.showClosedAssessments,
              this.toggleClosedAssessments
            )}
            <Collapse isOpen={this.state.showClosedAssessments}>{closedCards}</Collapse>
          </>
        ) : null
      display = (
        <>
          {openCardsCollapsible}
          {closedCardsCollapsible}
        </>
      )
    }
    /**
     * Finally, render the ContentDisplay.
     */
    return (
      <div className="Assessment">
        <ContentDisplay
          display={display}
          loadContentDispatch={this.props.handleAssessmentOverviewFetch}
        />
      </div>
    )
  }

  private toggleOpenAssessments = () =>
    this.setState({
      ...this.state,
      showOpenAssessments: !this.state.showOpenAssessments
    })

  private toggleClosedAssessments = () =>
    this.setState({
      ...this.state,
      showClosedAssessments: !this.state.showClosedAssessments
    })
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
          <h6>{`Grade: ${overview.maximumGrade}`}</h6>
        </div>
        <div className="row listing-description">
          <p className="col-xs-12">{overview.shortSummary}</p>
        </div>
        <div className="row between-xs middle-xs listing-controls">
          <div className="col-xs-8 listing-due-date-parent">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              {`Due: ${getPrettyDate(overview.closeAt)}`}
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

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) =>
  controlButton(label, isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT, toggleFunc, {
    minimal: true,
    className: 'collapse-button'
  })

export default Assessment
