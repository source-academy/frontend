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
    const questionId: number =
      stringParamToInt(this.props.match.params.questionId) || DEFAULT_QUESTION_ID

    /**
     * If there is an assessment to render, create a workspace.
     */
    if (assessmentId !== null) {
      const assessmentProps: AssessmentProps = {
        assessmentId,
        questionId
      }
      return <AssessmentWorkspaceContainer {...assessmentProps} />
    }

    // The item to be displayed in the ContentDisplay
    let display
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
      display = (
        <>
          {this.state.showOpenAssessments
            ? controlButton('Due soon', IconNames.CARET_DOWN, this.toggleOpenAssessments, {
                minimal: true,
                className: 'collapse-button'
              })
            : controlButton('Due soon', IconNames.CARET_RIGHT, this.toggleOpenAssessments, {
                minimal: true,
                className: 'collapse-button'
              })}
          <Collapse isOpen={this.state.showOpenAssessments}>{openCards}</Collapse>
          {this.state.showClosedAssessments
            ? controlButton('Closed', IconNames.CARET_DOWN, this.toggleClosedAssessments, {
                minimal: true,
                className: 'collapse-button'
              })
            : controlButton('Closed', IconNames.CARET_RIGHT, this.toggleClosedAssessments, {
                minimal: true,
                className: 'collapse-button'
              })}
          <Collapse isOpen={this.state.showClosedAssessments}>{closedCards}</Collapse>
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
          <h6>{`XP: ${overview.maximumEXP}`}</h6>
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

export default Assessment
