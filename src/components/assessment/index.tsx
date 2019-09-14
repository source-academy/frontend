import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Collapse,
  Dialog,
  Elevation,
  H4,
  H6,
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

import { sortBy } from 'lodash';
import defaultCoverImage from '../../assets/default_cover_image.jpg';
import AssessmentWorkspaceContainer from '../../containers/assessment/AssessmentWorkspaceContainer';
import NotificationBadge from '../../containers/notification/NotificationBadge';
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
import { filterNotificationsByAssessment } from '../notification/NotificationHelpers';
import { NotificationFilterFunction } from '../notification/notificationShape';

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
  handleAcknowledgeNotifications: (withFilter?: NotificationFilterFunction) => void;
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
      display = <NonIdealState description="Fetching assessment..." icon={<Spinner />} />;
    } else if (this.props.assessmentOverviews.length === 0) {
      display = <NonIdealState title="There are no assessments." icon={IconNames.FLAME} />;
    } else {
      /** Upcoming assessments, that are not released yet. */
      const isOverviewUpcoming = (overview: IAssessmentOverview) =>
        !beforeNow(overview.closeAt) && !beforeNow(overview.openAt);

      const upcomingCards = this.sortAssessments(
        this.props.assessmentOverviews.filter(isOverviewUpcoming)
      ).map((overview, index) =>
        this.makeOverviewCard(overview, index, !this.props.isStudent, false)
      );

      /** Opened assessments, that are released and can be attempted. */
      const isOverviewOpened = (overview: IAssessmentOverview) =>
        !beforeNow(overview.closeAt) &&
        beforeNow(overview.openAt) &&
        overview.status !== AssessmentStatuses.submitted;
      const openedCards = this.sortAssessments(
        this.props.assessmentOverviews.filter(overview => isOverviewOpened(overview))
      ).map((overview, index) => this.makeOverviewCard(overview, index, true, false));

      /** Closed assessments, that are past the due date or cannot be attempted further. */
      const closedCards = this.sortAssessments(
        this.props.assessmentOverviews.filter(
          overview => !isOverviewOpened(overview) && !isOverviewUpcoming(overview)
        )
      ).map((overview, index) => this.makeOverviewCard(overview, index, true, true));

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

  private sortAssessments = (assessments: IAssessmentOverview[]) =>
    sortBy(assessments, [a => -a.id]);

  private makeSubmissionButton = (overview: IAssessmentOverview, index: number) => (
    <Button
      disabled={overview.status !== AssessmentStatuses.attempted}
      icon={IconNames.CONFIRM}
      intent={overview.status === AssessmentStatuses.attempted ? Intent.DANGER : Intent.NONE}
      minimal={true}
      // intentional: each listing renders its own version of onClick
      // tslint:disable-next-line:jsx-no-lambda
      onClick={() => this.setBetchaAssessment(overview)}
    >
      <span className="custom-hidden-xxxs">Finalize</span>
      <span className="custom-hidden-xxs"> Submission</span>
    </Button>
  );

  private makeAssessmentInteractButton = (overview: IAssessmentOverview) => {
    let icon: IconName;
    let label: string;
    let optionalLabel: string = '';

    switch (overview.status) {
      case AssessmentStatuses.not_attempted:
        icon = IconNames.PLAY;
        label = 'Attempt';
        break;
      case AssessmentStatuses.attempting:
        icon = IconNames.PLAY;
        label = 'Continue';
        optionalLabel = ' Attempt';
        break;
      case AssessmentStatuses.attempted:
        icon = IconNames.EDIT;
        label = 'Review';
        optionalLabel = ' Attempt';
        break;
      case AssessmentStatuses.submitted:
        icon = IconNames.EYE_OPEN;
        label = 'Review';
        optionalLabel = ' Submission';
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
        <Button
          icon={icon}
          minimal={true}
          // intentional: each listing renders its own version of onClick
          // tslint:disable-next-line:jsx-no-lambda
          onClick={() =>
            this.props.handleAcknowledgeNotifications(filterNotificationsByAssessment(overview.id))
          }
        >
          <span className="custom-hidden-xxxs">{label}</span>
          <span className="custom-hidden-xxs">{optionalLabel}</span>
        </Button>
      </NavLink>
    );
  };

  /**
   * Create a series of cards to display IAssessmentOverviews.
   * @param {IAssessmentOverview} overview the assessment overview to display
   * @param {number} index a unique number for this card (required for sequential rendering).
   *   See {@link https://reactjs.org/docs/lists-and-keys.html#keys}
   * @param renderAttemptButton will only render the attempt button if true, regardless
   *   of attempt status.
   * @param notifications the notifications to be passed in.
   */
  private makeOverviewCard = (
    overview: IAssessmentOverview,
    index: number,
    renderAttemptButton: boolean,
    renderGradingStatus: boolean
  ) => (
    <div key={index}>
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className="col-xs-3 listing-picture">
          <NotificationBadge
            className="badge"
            notificationFilter={filterNotificationsByAssessment(overview.id)}
            large={true}
          />
          <img
            className={`cover-image-${overview.status}`}
            src={overview.coverImage ? overview.coverImage : defaultCoverImage}
          />
        </div>
        <div className="col-xs-9 listing-text">
          {this.makeOverviewCardTitle(overview, index, renderGradingStatus)}
          <div className="listing-grade">
            <H6>
              {beforeNow(overview.openAt)
                ? `Grade: ${overview.grade} / ${overview.maxGrade}`
                : `Max Grade: ${overview.maxGrade}`}
            </H6>
          </div>
          <div className="listing-xp">
            <H6>
              {beforeNow(overview.openAt)
                ? `XP: ${overview.xp} / ${overview.maxXp}`
                : `Max XP: ${overview.maxXp}`}
            </H6>
          </div>
          <div className="listing-description">
            <Markdown content={overview.shortSummary} />
          </div>
          <div className="listing-footer">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              {beforeNow(overview.openAt)
                ? `Due: ${getPrettyDate(overview.closeAt)}`
                : `Opens at: ${getPrettyDate(overview.openAt)}`}
            </Text>
            <div className="listing-button">
              {renderAttemptButton ? this.makeAssessmentInteractButton(overview) : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  private makeOverviewCardTitle = (
    overview: IAssessmentOverview,
    index: number,
    renderGradingStatus: boolean
  ) => (
    <div className="listing-header">
      <Text ellipsize={true}>
        <H4 className="listing-title">
          {overview.title}
          {overview.private ? (
            <Tooltip
              className="listing-title-tooltip"
              content="This assessment is password-protected."
            >
              <Icon icon="lock" />
            </Tooltip>
          ) : null}
          {renderGradingStatus ? makeGradingStatus(overview.gradingStatus) : null}
        </H4>
      </Text>
      <div className="listing-button">{this.makeSubmissionButton(overview, index)}</div>
    </div>
  );
}

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
    case GradingStatuses.none:
      iconName = IconNames.CROSS;
      intent = Intent.DANGER;
      tooltip = 'Not graded yet';
      break;
    default:
      // Shows default icon if this assessment is ungraded
      iconName = IconNames.DISABLE;
      intent = Intent.PRIMARY;
      tooltip = `Not applicable`;
      break;
  }

  return (
    <Tooltip className="listing-title-tooltip" content={tooltip} position={Position.RIGHT}>
      <Icon icon={iconName} intent={intent} />
    </Tooltip>
  );
};

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) =>
  controlButton(label, isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT, toggleFunc, {
    minimal: true,
    className: 'collapse-button'
  });

export default Assessment;
