import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Collapse,
  Dialog,
  Elevation,
  Icon,
  IconName,
  Intent,
  Menu,
  MenuItem,
  NonIdealState,
  Popover,
  Spinner,
  Text
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { NavLink } from 'react-router-dom'

import defaultCoverImage from '../../assets/default_cover_image.jpg'
import AssessmentWorkspaceContainer from '../../containers/assessment/AssessmentWorkspaceContainer'
import { beforeNow, getPrettyDate } from '../../utils/dateHelpers'
import { assessmentCategoryLink, stringParamToInt } from '../../utils/paramParseHelpers'
import {
  AssessmentCategory,
  AssessmentStatuses,
  IAssessmentOverview
} from '../assessment/assessmentShape'
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
  betchaAssessment: IAssessmentOverview | null
  showClosedAssessments: boolean
  showOpenAssessments: boolean
}

class Assessment extends React.Component<IAssessmentProps, State> {
  /**
   * Initialize state
   */
  public constructor(props: IAssessmentProps) {
    super(props)
    this.state = {
      betchaAssessment: null,
      showClosedAssessments: false,
      showOpenAssessments: true
    }
  }

  public render() {
    const assessmentId: number | null = stringParamToInt(this.props.match.params.assessmentId)
    const questionId: number =
      stringParamToInt(this.props.match.params.questionId) || DEFAULT_QUESTION_ID

    // If there is an assessment to render, create a workspace. The assessment
    // overviews must still be loaded for this, to send the due date.
    if (assessmentId !== null && this.props.assessmentOverviews !== undefined) {
      const assessmentProps: AssessmentProps = {
        assessmentId,
        questionId,
        // get the closeDate of the assessment
        closeDate: this.props.assessmentOverviews.filter(a => a.id === assessmentId)[0].closeAt
      }
      return <AssessmentWorkspaceContainer {...assessmentProps} />
    }

    // Otherwise, render a list of assessments to the user.
    let display: JSX.Element
    if (this.props.assessmentOverviews === undefined) {
      display = <NonIdealState description="Fetching assessment..." visual={<Spinner />} />
    } else if (this.props.assessmentOverviews.length === 0) {
      display = <NonIdealState title="There are no assessments." visual={IconNames.FLAME} />
    } else {
      const openCards = this.props.assessmentOverviews
        .filter(a => !beforeNow(a.closeAt))
        .map((overview, index) => makeOverviewCard(overview, index, this.setBetchaAssessment))
      const closedCards = this.props.assessmentOverviews
        .filter(a => beforeNow(a.closeAt))
        .map((overview, index) => makeOverviewCard(overview, index, this.setBetchaAssessment))
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

    // Define the betcha dialog (in each card's menu)
    const betchaText = this.state.betchaAssessment ? (
      <>
        <p>
          You are about to finalise your submission for the{' '}
          {this.state.betchaAssessment.category.toLowerCase()}{' '}
          <i>&quot;{this.state.betchaAssessment.title}&quot;</i>.
        </p>
        <p>
          Early submissions grant you additional XP, but{' '}
          <span className="warning">this action is irreversible.</span>
        </p>
      </>
    ) : (
      <>
        <p>You are about to finalise your submission.</p>
        <p>
          Early submissions grant you additional XP, but{' '}
          <span className="warning">this action is irreversible.</span>
        </p>
      </>
    )
    const betchaDialog = (
      <Dialog
        className="betcha-dialog"
        icon={IconNames.ERROR}
        isCloseButtonShown={false}
        isOpen={this.state.betchaAssessment !== null}
        title="Betcha: Early Submission"
      >
        <div className={Classes.DIALOG_BODY}>
          <Text>{betchaText}</Text>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonGroup>
            {controlButton('Cancel', null, this.setBetchaAssessmentNull, { minimal: false })}
            {controlButton('Finalise Submission', null, this.setBetchaAssessmentNull, {
              minimal: false,
              intent: Intent.DANGER
            })}
          </ButtonGroup>
        </div>
      </Dialog>
    )

    // Finally, render the ContentDisplay.
    return (
      <div className="Assessment">
        <ContentDisplay
          display={display}
          loadContentDispatch={this.props.handleAssessmentOverviewFetch}
        />
        {betchaDialog}
      </div>
    )
  }

  private toggleClosedAssessments = () =>
    this.setState({
      ...this.state,
      showClosedAssessments: !this.state.showClosedAssessments
    })

  private toggleOpenAssessments = () =>
    this.setState({
      ...this.state,
      showOpenAssessments: !this.state.showOpenAssessments
    })

  private setBetchaAssessment = (assessment: IAssessmentOverview | null) =>
    this.setState({
      ...this.state,
      betchaAssessment: assessment
    })

  private setBetchaAssessmentNull = () => this.setBetchaAssessment(null)
}

/**
 * Create a series of cards to display IAssessmentOverviews.
 * @param {IAssessmentOverview} overview the assessment overview to display
 * @param {number} index a unique number for this card (required for sequential rendering).
 *   See {@link https://reactjs.org/docs/lists-and-keys.html#keys}
 */
const makeOverviewCard = (
  overview: IAssessmentOverview,
  index: number,
  setBetchaAssessment: (assessment: IAssessmentOverview | null) => void
) => (
  <div key={index}>
    <Card className="row listing" elevation={Elevation.ONE}>
      <div className="col-xs-3 listing-picture">
        <img src={overview.coverImage ? overview.coverImage : defaultCoverImage} />
      </div>
      <div className="col-xs-9 listing-text">
        <div className="row listing-title">
          <Text ellipsize={true} className="col-xs-11">
            <h4>{overview.title}</h4>
          </Text>
          <Popover content={makeMenu(overview, index, setBetchaAssessment)}>
            <Button icon={IconNames.MENU} minimal={true} />
          </Popover>
        </div>
        <div className="row listing-order">
          <h6>{`Max Grade: ${overview.maximumGrade}`}</h6>
        </div>
        <div className="row listing-description">
          <Text className="col-xs-12" ellipsize={true}>
            {overview.shortSummary}
          </Text>
        </div>
        <div className="listing-controls">
          <Text className="listing-due-date">
            <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
            {`Due: ${getPrettyDate(overview.closeAt)}`}
          </Text>
          {makeOverviewCardButton(overview)}
        </div>
      </div>
    </Card>
  </div>
)

const makeMenu = (
  overview: IAssessmentOverview,
  index: number,
  setBetchaAssessment: (assessment: IAssessmentOverview | null) => void
) => (
  <Menu>
    <MenuItem
      disabled={true}
      icon={IconNames.ARROW_TOP_RIGHT}
      onClick={emptyFunc}
      text="Replay story"
    />
    <MenuItem
      icon={IconNames.CONFIRM}
      intent={Intent.DANGER}
      // intentional: each menu renders own version of onClick
      // tslint:disable-next-line:jsx-no-lambda
      onClick={() => setBetchaAssessment(overview)}
      text="Betcha"
    />
  </Menu>
)

const makeOverviewCardButton = (overview: IAssessmentOverview) => {
  let icon: IconName
  let label: string
  switch (overview.status) {
    case AssessmentStatuses.not_attempted:
      icon = IconNames.STEP_FORWARD
      label = 'Skip Story & Attempt'
      break
    case AssessmentStatuses.attempting:
      icon = IconNames.PLAY
      label = 'Continue Attempt'
      break
    case AssessmentStatuses.attempted:
      icon = IconNames.EDIT
      label = 'Review Attempt'
      break
    case AssessmentStatuses.submitted:
      icon = IconNames.EYE_OPEN
      label = 'Review Submission'
      break
    default:
      // If we reach this case, backend data did not fit IAssessmentOverview
      icon = IconNames.PLAY
      label = 'Review'
      break
  }
  return (
    <NavLink
      to={`/academy/${assessmentCategoryLink(
        overview.category
      )}/${overview.id.toString()}/${DEFAULT_QUESTION_ID}`}
    >
      {controlButton(label, icon)}
    </NavLink>
  )
}

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) =>
  controlButton(label, isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT, toggleFunc, {
    minimal: true,
    className: 'collapse-button'
  })

const emptyFunc = () => {}

export default Assessment
