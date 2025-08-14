import {
  Button,
  Card,
  Elevation,
  H4,
  H6,
  Icon,
  Intent,
  Position,
  Text,
  Tooltip
} from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router';
import classes from 'src/styles/Academy.module.scss';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import SessionActions from '../application/actions/SessionActions';
import Markdown from '../Markdown';
import NotificationBadge from '../notificationBadge/NotificationBadge';
import { filterNotificationsByAssessment } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';
import { beforeNow, getPrettyDate, getPrettyDateAfterHours } from '../utils/DateHelper';
import { useResponsive, useTypedSelector } from '../utils/Hooks';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import { AssessmentOverview, AssessmentStatuses } from './AssessmentTypes';

type AssessmentOverviewCardProps = {
  /** The assessment overview to display */
  overview: AssessmentOverview;
  /**
   * A unique number for this card (required for sequential rendering).
   * See {@link https://reactjs.org/docs/lists-and-keys.html#keys}
   */
  index: number;
  /** Will only render the attempt button if true, regardless of attempt status. */
  renderAttemptButton: boolean;
  renderGradingTooltip: boolean;
  makeSubmissionButton: (overview: AssessmentOverview, index: number) => JSX.Element;
};

/**
 * A card to display `AssessmentOverview`s.
 */
const AssessmentOverviewCard: React.FC<AssessmentOverviewCardProps> = ({
  overview,
  index,
  renderAttemptButton,
  renderGradingTooltip,
  makeSubmissionButton
}) => {
  const { isMobileBreakpoint } = useResponsive();
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
          <AssessmentOverviewCardTitle
            overview={overview}
            index={index}
            renderProgressStatus={renderGradingTooltip}
            makeSubmissionButton={makeSubmissionButton}
          />
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
                <Icon icon={IconNames.INFO_SIGN} />
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
                <Icon className="listing-due-icon" size={12} icon={IconNames.CALENDAR} />
                {`${beforeNow(overview.openAt) ? 'Opened' : 'Opens'}: ${getPrettyDate(
                  overview.openAt
                )}`}
              </Text>
              {beforeNow(overview.openAt) && (
                <Text className="listing-due-date">
                  <Icon className="listing-due-icon" size={12} icon={IconNames.TIME} />
                  {`Due: ${getPrettyDate(overview.closeAt)}`}
                </Text>
              )}
            </div>
            <div className="listing-button">
              {renderAttemptButton ? <AssessmentInteractButton overview={overview} /> : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

type AssessmentOverviewCardTitleProps = {
  overview: AssessmentOverview;
  index: number;
  renderProgressStatus: boolean;
  makeSubmissionButton: (overview: AssessmentOverview, index: number) => JSX.Element;
};

const AssessmentOverviewCardTitle: React.FC<AssessmentOverviewCardTitleProps> = ({
  overview,
  index,
  renderProgressStatus,
  makeSubmissionButton
}) => (
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

type AssessmentInteractButtonProps = {
  overview: AssessmentOverview;
};

const AssessmentInteractButton: React.FC<AssessmentInteractButtonProps> = ({ overview }) => {
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

  const courseId = useTypedSelector(state => state.session.courseId);
  const dispatch = useDispatch();

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

export default AssessmentOverviewCard;
