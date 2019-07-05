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
  NonIdealState,
  Position,
  Spinner,
  Text,
  Tooltip
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import AssessmentWorkspaceContainer from '../../containers/assessment/AssessmentWorkspaceContainer';
import { beforeNow, getPrettyDate } from '../../utils/dateHelpers';
import { assessmentCategoryLink, stringParamToInt } from '../../utils/paramParseHelpers';
import {
  AssessmentCategory,
  AssessmentStatuses,
  GradingStatuses,
  IAssessmentOverview
} from '../assessment/assessmentShape';
import { OwnProps as AssessmentProps } from '../assessment/AssessmentWorkspace';
import { controlButton } from '../commons';
import ContentDisplay from '../commons/ContentDisplay';
import Markdown from '../commons/Markdown';

const DEFAULT_QUESTION_ID: number = 0;

export interface IAssessmentWorkspaceParams {
  assessmentId?: string;
  questionId?: string;
}

export interface IAssessmentProps
  extends IDispatchProps,
    IOwnProps,
    RouteComponentProps<IAssessmentWorkspaceParams>,
    IStateProps {}

export interface IDispatchProps {
  handleAssessmentOverviewFetch: () => void;
  handleSubmitAssessment: (id: number) => void;
}

export interface IOwnProps {
  assessmentCategory: AssessmentCategory;
}

export interface IStateProps {
  assessmentOverviews?: IAssessmentOverview[];
  isStudent: boolean;
}

type State = {
  betchaAssessment: IAssessmentOverview | null;
  showClosedAssessments: boolean;
  showOpenedAssessments: boolean;
  showUpcomingAssessments: boolean;
};

class Assessment extends React.Component<IAssessmentProps, State> {
  /**
   * Initialize state
   */
  public constructor(props: IAssessmentProps) {
    super(props);
    this.state = {
      betchaAssessment: null,
      showClosedAssessments: false,
      showOpenedAssessments: true,
      showUpcomingAssessments: true
    };
  }

  public render() {
    const assessmentId: number | null = stringParamToInt(this.props.match.params.assessmentId);
    const questionId: number =
      stringParamToInt(this.props.match.params.questionId) || DEFAULT_QUESTION_ID;

    // If there is an assessment to render, create a workspace. The assessment
    // overviews must still be loaded for this, to send the due date.
    if (assessmentId !== null && this.props.assessmentOverviews !== undefined) {
      const overview = this.props.assessmentOverviews.filter(a => a.id === assessmentId)[0];
      const assessmentProps: AssessmentProps = {
        assessmentId,
        questionId,
        notAttempted: overview.status === AssessmentStatuses.not_attempted,
        closeDate: overview.closeAt
      };
      return <AssessmentWorkspaceContainer {...assessmentProps} />;
    }

    // Otherwise, render a list of assessments to the user.
    let display: JSX.Element;
    if (this.props.assessmentOverviews === undefined) {
      display = <NonIdealState description="Fetching assessment..." visual={<Spinner />} />;
    } else if (this.props.assessmentOverviews.length === 0) {
      display = <NonIdealState title="There are no assessments." visual={IconNames.FLAME} />;
    } else {
      /** Upcoming assessments, that are not released yet. */
      const isOverviewUpcoming = (overview: IAssessmentOverview) =>
        !beforeNow(overview.closeAt) && !beforeNow(overview.openAt);
      const upcomingCards = this.props.assessmentOverviews
        .filter(isOverviewUpcoming)
        .map((overview, index) =>
          makeOverviewCard(overview, index, this.setBetchaAssessment, !this.props.isStudent, false)
        );

      /** Opened assessments, that are released and can be attempted. */
      const isOverviewOpened = (overview: IAssessmentOverview) =>
        !beforeNow(overview.closeAt) &&
        beforeNow(overview.openAt) &&
        overview.status !== AssessmentStatuses.submitted;
      const openedCards = this.props.assessmentOverviews
        .filter(overview => isOverviewOpened(overview))
        .map((overview, index) =>
          makeOverviewCard(overview, index, this.setBetchaAssessment, true, false)
        );

      /** Closed assessments, that are past the due date or cannot be attempted further. */
      const closedCards = this.props.assessmentOverviews
        .filter(overview => !isOverviewOpened(overview) && !isOverviewUpcoming(overview))
        .map((overview, index) =>
          makeOverviewCard(overview, index, this.setBetchaAssessment, true, true)
        );

      /** Render cards */
      const upcomingCardsCollapsible =
        upcomingCards.length > 0 ? (
          <>
            {collapseButton(
              'Upcoming',
              this.state.showUpcomingAssessments,
              this.toggleUpcomingAssessments
            )}
            <Collapse isOpen={this.state.showUpcomingAssessments}>{upcomingCards}</Collapse>
          </>
        ) : null;
      const openedCardsCollapsible =
        openedCards.length > 0 ? (
          <>
            {collapseButton('Open', this.state.showOpenedAssessments, this.toggleOpenAssessments)}
            <Collapse isOpen={this.state.showOpenedAssessments}>{openedCards}</Collapse>
          </>
        ) : null;
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
        ) : null;
      display = (
        <>
          {upcomingCardsCollapsible}
          {openedCardsCollapsible}
          {closedCardsCollapsible}
        </>
      );
    }

    // Define the betcha dialog (in each card's menu)
    const betchaText = this.state.betchaAssessment ? (
      <>
        <p>
          You are about to finalise your submission for the{' '}
          {this.state.betchaAssessment.category.toLowerCase()}{' '}
          <i>
            &quot;
            {this.state.betchaAssessment.title}
            &quot;
          </i>
          .
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
    );
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
            {controlButton('Finalise Submission', null, this.submitAssessment, {
              minimal: false,
              intent: Intent.DANGER
            })}
          </ButtonGroup>
        </div>
      </Dialog>
    );

    // Finally, render the ContentDisplay.
    return (
      <div className="Assessment">
        <ContentDisplay
          display={display}
          loadContentDispatch={this.props.handleAssessmentOverviewFetch}
        />
        {betchaDialog}
      </div>
    );
  }

  private toggleClosedAssessments = () =>
    this.setState({
      ...this.state,
      showClosedAssessments: !this.state.showClosedAssessments
    });

  private toggleOpenAssessments = () =>
    this.setState({
      ...this.state,
      showOpenedAssessments: !this.state.showOpenedAssessments
    });

  private toggleUpcomingAssessments = () =>
    this.setState({
      ...this.state,
      showUpcomingAssessments: !this.state.showUpcomingAssessments
    });

  private setBetchaAssessment = (assessment: IAssessmentOverview | null) =>
    this.setState({
      ...this.state,
      betchaAssessment: assessment
    });

  private setBetchaAssessmentNull = () => this.setBetchaAssessment(null);

  private submitAssessment = () => {
    if (this.state.betchaAssessment) {
      this.props.handleSubmitAssessment(this.state.betchaAssessment.id);
      this.setBetchaAssessmentNull();
    }
  };
}

/**
 * Create a series of cards to display IAssessmentOverviews.
 * @param {IAssessmentOverview} overview the assessment overview to display
 * @param {number} index a unique number for this card (required for sequential rendering).
 *   See {@link https://reactjs.org/docs/lists-and-keys.html#keys}
 * @param setBetchaAssessment a function that handles the side-effect of setting which assessment
 *   is to be set for final submission ("betcha" functionality)
 * @param renderAttemptButton will only render the attempt button if true, regardless
 *   of attempt status.
 */
const makeOverviewCard = (
  overview: IAssessmentOverview,
  index: number,
  setBetchaAssessment: (assessment: IAssessmentOverview | null) => void,
  renderAttemptButton: boolean,
  renderGradingStatus: boolean
) => (
  <div key={index}>
    <Card className="row listing" elevation={Elevation.ONE}>
      <div className="col-xs-3 listing-picture">
        <img
          className={`cover-image-${overview.status}`}
          src={overview.coverImage ? overview.coverImage : defaultCoverImage}
        />
      </div>
      <div className="col-xs-9 listing-text">
        {makeOverviewCardTitle(overview, index, setBetchaAssessment, renderGradingStatus)}
        <div className="row listing-grade">
          <h6>
            {' '}
            {beforeNow(overview.openAt)
              ? `Grade: ${overview.grade} / ${overview.maxGrade}`
              : `Max Grade: ${overview.maxGrade}`}{' '}
          </h6>
        </div>
        <div className="row listing-xp">
          <h6>
            {' '}
            {beforeNow(overview.openAt)
              ? `XP: ${overview.xp} / ${overview.maxXp}`
              : `Max XP: ${overview.maxXp}`}{' '}
          </h6>
        </div>
        <div className="row listing-description">
          <Markdown content={overview.shortSummary} />
        </div>
        <div className="listing-controls">
          <Text className="listing-due-date">
            <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
            {beforeNow(overview.openAt)
              ? `Due: ${getPrettyDate(overview.closeAt)}`
              : `Opens at: ${getPrettyDate(overview.openAt)}`}
          </Text>
          {renderAttemptButton ? makeOverviewCardButton(overview) : null}
        </div>
      </div>
    </Card>
  </div>
);

const makeOverviewCardTitle = (
  overview: IAssessmentOverview,
  index: number,
  setBetchaAssessment: (assessment: IAssessmentOverview | null) => void,
  renderGradingStatus: boolean
) => (
  <div className="row listing-title">
    <Text ellipsize={true} className={'col-xs-10'}>
      <h4>
        {overview.title} {renderGradingStatus ? makeGradingStatus(overview.gradingStatus) : null}
      </h4>
    </Text>
    <div className="col-xs-2">{makeSubmissionButton(overview, index, setBetchaAssessment)}</div>
  </div>
);

const makeGradingStatus = (gradingStatus: string) => {
  let iconName: IconName;
  let intent: Intent;
  let tooltip: string;

  switch (gradingStatus) {
    case GradingStatuses.graded:
      iconName = IconNames.TICK;
      intent = Intent.SUCCESS;
      tooltip = 'Fully graded';
      break;

    case GradingStatuses.grading:
      iconName = IconNames.TIME;
      intent = Intent.WARNING;
      tooltip = 'Grading in progress';
      break;

    default:
      iconName = IconNames.CROSS;
      intent = Intent.DANGER;
      tooltip = 'Not graded yet';
      break;
  }

  return (
    <Tooltip content={tooltip} position={Position.RIGHT}>
      <Icon icon={iconName} intent={intent} />
    </Tooltip>
  );
};

const makeSubmissionButton = (
  overview: IAssessmentOverview,
  index: number,
  setBetchaAssessment: (assessment: IAssessmentOverview | null) => void
) => (
  <Button
    disabled={overview.status !== AssessmentStatuses.attempted}
    icon={IconNames.CONFIRM}
    intent={overview.status === AssessmentStatuses.attempted ? Intent.DANGER : Intent.NONE}
    minimal={true}
    // intentional: each menu renders own version of onClick
    // tslint:disable-next-line:jsx-no-lambda
    onClick={() => setBetchaAssessment(overview)}
  >
    Finalize Submission
  </Button>
);

const makeOverviewCardButton = (overview: IAssessmentOverview) => {
  let icon: IconName;
  let label: string;
  switch (overview.status) {
    case AssessmentStatuses.not_attempted:
      icon = IconNames.STEP_FORWARD;
      label = overview.story ? 'Skip Story & Attempt' : 'Attempt';
      break;
    case AssessmentStatuses.attempting:
      icon = IconNames.PLAY;
      label = 'Continue Attempt';
      break;
    case AssessmentStatuses.attempted:
      icon = IconNames.EDIT;
      label = 'Review Attempt';
      break;
    case AssessmentStatuses.submitted:
      icon = IconNames.EYE_OPEN;
      label = 'Review Submission';
      break;
    default:
      // If we reach this case, backend data did not fit IAssessmentOverview
      icon = IconNames.PLAY;
      label = 'Review';
      break;
  }
  return (
    <NavLink
      to={`/academy/${assessmentCategoryLink(
        overview.category
      )}/${overview.id.toString()}/${DEFAULT_QUESTION_ID}`}
    >
      {controlButton(label, icon)}
    </NavLink>
  );
};

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) =>
  controlButton(label, isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT, toggleFunc, {
    minimal: true,
    className: 'collapse-button'
  });

export default Assessment;
