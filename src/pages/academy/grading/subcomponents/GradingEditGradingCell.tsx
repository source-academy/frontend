import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import controlButton from '../../../../commons/ControlButton';
import { filterNotificationsBySubmission } from '../../../../commons/notificationBadge/NotificationBadgeHelper';
import { NotificationFilterFunction } from '../../../../commons/notificationBadge/NotificationBadgeTypes';
import { GradingOverviewWithNotifications } from '../../../../features/grading/GradingTypes';

type EditGradingCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleAcknowledgeNotifications: (withFilter?: NotificationFilterFunction) => void;
};

type StateProps = {
  data: GradingOverviewWithNotifications;
};

/**
 * Used to render a link in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradingEditGradingCell extends React.Component<EditGradingCellProps, {}> {
  public render() {
    return (
      <NavLink
        to={`/academy/grading/${this.props.data.submissionId}`}
        activeClassName={Classes.ACTIVE}
      >
        {controlButton(
          '',
          IconNames.ANNOTATION,
          () =>
            this.props.handleAcknowledgeNotifications(
              filterNotificationsBySubmission(this.props.data.submissionId)
            ),
          { fullWidth: true }
        )}
      </NavLink>
    );
  }
}

export default GradingEditGradingCell;
