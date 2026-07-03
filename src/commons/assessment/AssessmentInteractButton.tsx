import { Button } from '@blueprintjs/core';
import { type IconName, IconNames } from '@blueprintjs/icons';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router';

import SessionActions from '../application/actions/SessionActions';
import { filterNotificationsByAssessment } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';
import { useAppSelector } from '../utils/Hooks';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import { type AssessmentOverview, AssessmentStatuses } from './AssessmentTypes';

type Props = {
  overview: AssessmentOverview;
};

function AssessmentInteractButton({ overview }: Props) {
  const courseId = useAppSelector(state => state.session.courseId);
  const dispatch = useDispatch();
  const { icon, label, optionalLabel } = createButtonConfiguration(overview.status);

  return (
    <NavLink
      to={`/courses/${courseId}/${assessmentTypeLink(overview.type)}/${overview.id.toString()}/${
        Constants.defaultQuestionId
      }`}
    >
      <Button
        icon={icon}
        variant="minimal"
        onClick={() =>
          dispatch(
            SessionActions.acknowledgeNotifications(filterNotificationsByAssessment(overview.id)),
          )
        }
      >
        <span data-testid="Assessment-Attempt-Button">{label}</span>
        {optionalLabel && <span className="custom-hidden-xxxs">{optionalLabel}</span>}
      </Button>
    </NavLink>
  );
}

type ButtonConfiguration = {
  icon: IconName;
  label: string;
  optionalLabel?: string;
};

const createButtonConfiguration = (
  overviewStatus: AssessmentOverview['status'],
): ButtonConfiguration => {
  let icon: IconName;
  let label: string;
  let optionalLabel: string | undefined;

  switch (overviewStatus) {
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

  return { icon, label, optionalLabel };
};

export default AssessmentInteractButton;
