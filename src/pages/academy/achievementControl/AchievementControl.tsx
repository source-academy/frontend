import React from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

export type DispatchProps = {};

export type StateProps = {};

function AchievementControl() {
  return (
    <div className="Achievements">
      <div className="achievement-main">
        <AchievementControlPanel />

        <AchievementEditor />
      </div>
    </div>
  );
}

export default AchievementControl;
