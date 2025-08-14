import { Card, Elevation, H4, H6, Icon, Intent, Position, Text, Tooltip } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import classes from 'src/styles/Academy.module.scss';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import Markdown from '../Markdown';
import NotificationBadge from '../notificationBadge/NotificationBadge';
import { filterNotificationsByAssessment } from '../notificationBadge/NotificationBadgeHelper';
import { beforeNow, getPrettyDate, getPrettyDateAfterHours } from '../utils/DateHelper';
import { useResponsive } from '../utils/Hooks';
import AssessmentInteractButton from './AssessmentInteractButton';
import { AssessmentOverview } from './AssessmentTypes';

type AssessmentOverviewCardProps = {
  /** The assessment overview to display */
  overview: AssessmentOverview;
  /** Will only render the attempt button if true, regardless of attempt status. */
  renderAttemptButton: boolean;
  renderGradingTooltip: boolean;
  makeSubmissionButton: (overview: AssessmentOverview) => JSX.Element;
};

/** A card to display `AssessmentOverview`s. */
const AssessmentOverviewCard: React.FC<AssessmentOverviewCardProps> = ({
  overview,
  renderAttemptButton,
  renderGradingTooltip,
  makeSubmissionButton
}) => {
  const { isMobileBreakpoint } = useResponsive();
  return (
    <div>
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
  renderProgressStatus: boolean;
  makeSubmissionButton: (overview: AssessmentOverview) => JSX.Element;
};

const AssessmentOverviewCardTitle: React.FC<AssessmentOverviewCardTitleProps> = ({
  overview,
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
    <div className="listing-button">{makeSubmissionButton(overview)}</div>
  </div>
);

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
