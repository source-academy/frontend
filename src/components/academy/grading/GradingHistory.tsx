import { Icon, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import * as React from 'react'

import { GradingOverview } from './gradingShape'

type GradingNavLinkProps = {
  data: GradingOverview
}

/**
 * Used to render the marks in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradingHistory extends React.Component<GradingNavLinkProps, {}> {
  constructor(props: GradingNavLinkProps) {
    super(props)
  }

  public render() {
    const popoverInfo = () => (
      <div className="col-xs-12" style={{ padding: 10 }}>
        <p>Initial Grade: {this.props.data.initialGrade}</p>
        <p>Grade Adjustments: {this.props.data.gradeAdjustment}</p>
        <p>Initial XP: {this.props.data.initialXp}</p>
        <p>XP Adjustments: {this.props.data.xpAdjustment}</p>
      </div>
    )

    return (
      <Popover
        content={popoverInfo()}
        position={Position.LEFT}
        interactionKind={PopoverInteractionKind.HOVER}
      >
        <Icon className="grade-edit-icon" iconSize={16} icon={IconNames.HISTORY} />
      </Popover>
    )
  }
}

export default GradingHistory
