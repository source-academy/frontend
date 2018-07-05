import * as React from 'react'
import { NavLink } from 'react-router-dom'

import { GradingOverview } from './gradingShape'

type GradingNavLinkProps = {
  data: GradingOverview
}

/**
 * Used to render a button in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in ag-grid.
 */
class GradingNavLink extends React.Component<GradingNavLinkProps, {}> {
  constructor(props: GradingNavLinkProps) {
    super(props);
  }

  public render() {
    return (
      <NavLink
        to={`/academy/grading/${this.props.data.submissionId}`}
        activeClassName="pt-active"
      >
        {this.props.data.graded ? 'Done' : 'Not Graded'}
      </NavLink>
    );
  }
};

export default GradingNavLink