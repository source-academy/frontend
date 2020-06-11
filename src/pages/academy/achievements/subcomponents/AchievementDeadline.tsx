import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementDeadlineProps = {
  deadline?: Date;
};

function AchievementDeadline(props: AchievementDeadlineProps) {
  const { deadline } = props;

  /**
   * Gets the Time Remaining for the particular achievement
   *
   * @returns a JSX.Element which displays the time remaining
   */

  const getTimeRemaining = () => {
    if (deadline) {
      if (deadline.getTime() >= new Date().getTime()) {
        const hoursLeft = Math.floor(
          (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        );
        return (
          <div className="deadline">
            <Icon icon={IconNames.STOPWATCH} />
            <p>{`${hoursLeft} hours`}</p>
          </div>
        );
      }

      return (
        <div className="deadline">
          <Icon icon={IconNames.STOPWATCH} />
          <p>{`Expired`}</p>
        </div>
      );
    }

    return <div className="deadline"></div>;
  };

  return <>{getTimeRemaining()}</>;
}

export default AchievementDeadline;
