import {
  Button,
  Card,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
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
import classNames from 'classnames';
import { sortBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useLoaderData, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import classes from 'src/styles/Academy.module.scss';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import SessionActions from '../application/actions/SessionActions';
import { Role } from '../application/ApplicationTypes';
import AssessmentWorkspace, {
  AssessmentWorkspaceProps
} from '../assessmentWorkspace/AssessmentWorkspace';
import ContentDisplay from '../ContentDisplay';
import ControlButton from '../ControlButton';
import Markdown from '../Markdown';
import NotificationBadge from '../notificationBadge/NotificationBadge';
import { filterNotificationsByAssessment } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';
import { beforeNow, getPrettyDate, getPrettyDateAfterHours } from '../utils/DateHelper';
import { useResponsive, useSession } from '../utils/Hooks';
import { assessmentTypeLink, convertParamToInt } from '../utils/ParamParseHelper';
import AssessmentNotFound from './AssessmentNotFound';
import {
  AssessmentConfiguration,
  AssessmentOverview,
  AssessmentStatuses,
  AssessmentWorkspaceParams
} from './AssessmentTypes';

const Assessment: React.FC = () => {
  const params = useParams<AssessmentWorkspaceParams>();
  const { isMobileBreakpoint } = useResponsive();
  const [betchaAssessment, setBetchaAssessment] = useState<AssessmentOverview | null>(null);
  const [showClosedAssessments, setShowClosedAssessments] = useState(false);
  const [showOpenedAssessments, setShowOpenedAssessments] = useState(true);
  const [showUpcomingAssessments, setShowUpcomingAssessments] = useState(true);

  const { courseId, role, assessmentOverviews: assessmentOverviewsUnfiltered } = useSession();
  const dispatch = useDispatch();

  const toggleClosedAssessments = () => setShowClosedAssessments(!showClosedAssessments);
  const toggleOpenAssessments = () => setShowOpenedAssessments(!showOpenedAssessments);
  const toggleUpcomingAssessments = () => setShowUpcomingAssessments(!showUpcomingAssessments);
  const setBetchaAssessmentNull = () => setBetchaAssessment(null);
  const handleSubmitAssessment = () => {
    if (betchaAssessment) {
      dispatch(SessionActions.submitAssessment(betchaAssessment.id));
      setBetchaAssessmentNull();
    }
  };

  const sortAssessments = (assessments: AssessmentOverview[]) => sortBy(assessments, [a => -a.id]);

  const makeSubmissionButton = (overview: AssessmentOverview, index: number) => (
    <Tooltip
      disabled={overview.status === AssessmentStatuses.attempted}
      content={'You can finalize after saving an answer for each question!'}
      position={Position.RIGHT}
    >
      <Button
        disabled={overview.status !== AssessmentStatuses.attempted}
        icon={IconNames.CONFIRM}
        intent={overview.status === AssessmentStatuses.attempted ? Intent.DANGER : Intent.NONE}
        minimal={true}
        // intentional: each listing renders its own version of onClick
        // tslint:disable-next-line:jsx-no-lambda
        onClick={() => setBetchaAssessment(overview)}
      >
        <span>Finalize</span>
        <span className="custom-hidden-xxs"> Submission</span>
      </Button>
    </Tooltip>
  );

  const makeAssessmentInteractButton = (overview: AssessmentOverview) => {
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
        to={`/courses/${courseId}/${assessmentTypeLink(overview.type)}/${overview.id.toString()}/${
          Constants.defaultQuestionId
        }`}
      >
        <Button
          icon={icon}
          minimal={true}
          onClick={() =>
            dispatch(
              SessionActions.acknowledgeNotifications(filterNotificationsByAssessment(overview.id))
            )
          }
        >
          <span data-testid="Assessment-Attempt-Button">{label}</span>
          <span className="custom-hidden-xxxs">{optionalLabel}</span>
        </Button>
      </NavLink>
    );
  };

  /**
   * Create a series of cards to display IAssessmentOverviews.
   * @param {AssessmentOverview} overview the assessment overview to display
   * @param {number} index a unique number for this card (required for sequential rendering).
   *   See {@link https://reactjs.org/docs/lists-and-keys.html#keys}
   * @param renderAttemptButton will only render the attempt button if true, regardless
   *   of attempt status.
   * @param notifications the notifications to be passed in.
   */
  const makeOverviewCard = (
    overview: AssessmentOverview,
    index: number,
    renderAttemptButton: boolean,
    renderGradingTooltip: boolean
  ) => {
    return (
      <div key={index}>
        <Card className="row listing" elevation={Elevation.ONE}>
          <div className={classNames('listing-picture', !isMobileBreakpoint && 'col-xs-3')}>
            <NotificationBadge
              className="badge"
              notificationFilter={filterNotificationsByAssessment(overview.id)}
              large={true}
            />
            <img
              alt="Assessment"
              className={`cover-image-${overview.status}`}
              src={overview.coverImage ? overview.coverImage : defaultCoverImage}
            />
          </div>
          <div className={classNames('listing-text', !isMobileBreakpoint && 'col-xs-9')}>
            {makeOverviewCardTitle(overview, index, renderGradingTooltip)}
            <div className={classes['listing-xp']}>
              <H6>
                {overview.isGradingPublished
                  ? `XP: ${overview.xp} / ${overview.maxXp}`
                  : `Max XP: ${overview.maxXp}`}
              </H6>
              {overview.earlySubmissionXp > 0 && (
                <Tooltip
                  content={`Max XP ends on ${getPrettyDateAfterHours(overview.openAt, overview.hoursBeforeEarlyXpDecay)}`}
                >
                  <Icon icon={IconNames.InfoSign} />
                </Tooltip>
              )}
            </div>
            <div className="listing-description">
              <Markdown content={overview.shortSummary} />
            </div>
            {overview.maxTeamSize > 1 ? (
              <div className="listing-team_information">
                <H6> This is a team assessment. </H6>
              </div>
            ) : (
              <div>
                <H6> This is an individual assessment. </H6>
              </div>
            )}
            <div className="listing-footer">
              <div>
                <Text className="listing-due-date">
                  <Icon className="listing-due-icon" iconSize={12} icon={IconNames.CALENDAR} />
                  {`${beforeNow(overview.openAt) ? 'Opened' : 'Opens'}: ${getPrettyDate(
                    overview.openAt
                  )}`}
                </Text>
                {beforeNow(overview.openAt) && (
                  <Text className="listing-due-date">
                    <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
                    {`Due: ${getPrettyDate(overview.closeAt)}`}
                  </Text>
                )}
              </div>
              <div className="listing-button">
                {renderAttemptButton ? makeAssessmentInteractButton(overview) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const makeOverviewCardTitle = (
    overview: AssessmentOverview,
    index: number,
    renderProgressStatus: boolean
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
          {renderProgressStatus ? showGradingTooltip(overview.isGradingPublished) : null}
        </H4>
      </Text>
      <div className="listing-button">{makeSubmissionButton(overview, index)}</div>
    </div>
  );

  // Rendering Logic
  const assessmentConfigToLoad = useLoaderData() as AssessmentConfiguration;
  const assessmentOverviews = useMemo(
    () => assessmentOverviewsUnfiltered?.filter(ao => ao.type === assessmentConfigToLoad.type),
    [assessmentConfigToLoad.type, assessmentOverviewsUnfiltered]
  );

  // If assessmentId or questionId is defined but not numeric, redirect back to the Assessment overviews page
  if (
    (params.assessmentId && !params.assessmentId?.match(numberRegExp)) ||
    (params.questionId && !params.questionId?.match(numberRegExp))
  ) {
    return <Navigate to={`/courses/${courseId}/${assessmentConfigToLoad.type}`} />;
  }

  const assessmentId: number | null = convertParamToInt(params.assessmentId);
  const questionId: number = convertParamToInt(params.questionId) || Constants.defaultQuestionId;

  // If there is an assessment to render, create a workspace. The assessment
  // overviews must still be loaded for this, to send the due date.
  if (assessmentId !== null && assessmentOverviews !== undefined) {
    const overview = assessmentOverviews.filter(a => a.id === assessmentId)[0];
    if (!overview) {
      return <AssessmentNotFound />;
    }

    const notAttempted = overview.status === AssessmentStatuses.not_attempted;
    const assessmentWorkspaceProps: AssessmentWorkspaceProps = {
      assessmentId,
      questionId,
      notAttempted,
      needsPassword: !!overview.private && notAttempted,
      canSave:
        role !== Role.Student ||
        (overview.status !== AssessmentStatuses.submitted && !beforeNow(overview.closeAt)),
      assessmentConfiguration: assessmentConfigToLoad
    };
    return <AssessmentWorkspace {...assessmentWorkspaceProps} />;
  }

  // Otherwise, render a list of assOwnProps
  let display: JSX.Element;
  if (assessmentOverviews === undefined) {
    display = <NonIdealState description="Fetching assessment..." icon={<Spinner />} />;
  } else if (assessmentOverviews.length === 0) {
    display = <NonIdealState title="There are no assessments." icon={IconNames.FLAME} />;
  } else {
    /** Upcoming assessments, that are not released yet. */
    const isOverviewUpcoming = (overview: AssessmentOverview) =>
      !beforeNow(overview.closeAt) && !beforeNow(overview.openAt);
    const upcomingCards = sortAssessments(assessmentOverviews.filter(isOverviewUpcoming)).map(
      (overview, index) => makeOverviewCard(overview, index, role !== Role.Student, false)
    );

    /** Opened assessments, that are released and can be attempted. */
    const isOverviewOpened = (overview: AssessmentOverview) =>
      !beforeNow(overview.closeAt) &&
      beforeNow(overview.openAt) &&
      overview.status !== AssessmentStatuses.submitted;
    const openedCards = sortAssessments(
      assessmentOverviews.filter(overview => isOverviewOpened(overview))
    ).map((overview, index) => makeOverviewCard(overview, index, true, false));

    /** Closed assessments, that are past the due date or cannot be attempted further. */
    const closedCards = sortAssessments(
      assessmentOverviews.filter(
        overview => !isOverviewOpened(overview) && !isOverviewUpcoming(overview)
      )
    ).map((overview, index) => makeOverviewCard(overview, index, true, true));

    /** Render cards */
    const upcomingCardsCollapsible = (
      <>
        {collapseButton('Upcoming', showUpcomingAssessments, toggleUpcomingAssessments)}
        <Collapse isOpen={showUpcomingAssessments}>{upcomingCards}</Collapse>
      </>
    );

    const openedCardsCollapsible = (
      <>
        {collapseButton('Open', showOpenedAssessments, toggleOpenAssessments)}
        <Collapse isOpen={showOpenedAssessments}>{openedCards}</Collapse>
      </>
    );

    const closedCardsCollapsible = (
      <>
        {collapseButton('Closed', showClosedAssessments, toggleClosedAssessments)}
        <Collapse isOpen={showClosedAssessments}>{closedCards}</Collapse>
      </>
    );

    display = (
      <>
        {upcomingCards.length > 0 ? upcomingCardsCollapsible : null}
        {openedCards.length > 0 ? openedCardsCollapsible : null}
        {closedCards.length > 0 ? closedCardsCollapsible : null}
      </>
    );
  }

  // Define the warning text when finalising submissions
  const hasBonusXp = (betchaAssessment?.earlySubmissionXp as number) > 0;
  const warningText = hasBonusXp ? (
    <p>
      Finalising your submission early grants you additional XP, but{' '}
      <span className="warning">this action is irreversible.</span>
    </p>
  ) : (
    <p>
      Finalising your submission early does not grant you additional XP, and{' '}
      <span className="warning">this action is irreversible.</span>
    </p>
  );

  // Define the betcha dialog (in each card's menu)
  const submissionText = betchaAssessment ? (
    <p>
      You are about to finalise your submission for the {betchaAssessment.type.toLowerCase()}{' '}
      <i>&quot;{betchaAssessment.title}&quot;</i>.
    </p>
  ) : (
    <p>You are about to finalise your submission.</p>
  );
  const betchaText = (
    <>
      {submissionText}
      {warningText}
    </>
  );
  const betchaDialog = (
    <Dialog
      className="betcha-dialog"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={betchaAssessment !== null}
      onClose={setBetchaAssessmentNull}
      title="Finalise submission?"
    >
      <DialogBody>
        <Text>{betchaText}</Text>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <ControlButton
              label="Cancel"
              onClick={setBetchaAssessmentNull}
              options={{ minimal: false }}
            />
            <ControlButton
              label="Finalise"
              onClick={handleSubmitAssessment}
              options={{ minimal: false, intent: Intent.DANGER }}
            />
          </>
        }
      />
    </Dialog>
  );

  // Finally, render the ContentDisplay.
  return (
    <div className="Assessment">
      <ContentDisplay
        display={display}
        loadContentDispatch={() => dispatch(SessionActions.fetchAssessmentOverviews())}
      />
      {betchaDialog}
    </div>
  );
};

const showGradingTooltip = (isGradingPublished: boolean) => {
  let iconName: IconName;
  let intent: Intent;
  let tooltip: string;

  if (isGradingPublished) {
    iconName = IconNames.TICK;
    intent = Intent.SUCCESS;
    tooltip = 'Fully graded';
  } else {
    // shh, hide actual grading progress from users even if graded
    iconName = IconNames.TIME;
    intent = Intent.WARNING;
    tooltip = 'Grading in progress';
  }

  return (
    <Tooltip className="listing-title-tooltip" content={tooltip} placement={Position.RIGHT}>
      <Icon icon={iconName} intent={intent} />
    </Tooltip>
  );
};

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) => (
  <ControlButton
    label={label}
    icon={isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
    onClick={toggleFunc}
    options={{ minimal: true, className: 'collapse-button' }}
  />
);

export default Assessment;
