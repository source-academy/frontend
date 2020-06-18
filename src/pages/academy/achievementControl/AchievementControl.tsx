import React from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import { achievementDict, achievementModalDict } from '../../../commons/mocks/AchievementMocks';

export type DispatchProps = {};

export type StateProps = {};

function AchievementControl() {
  return (
    <div className="AchievementControl">
      <AchievementControlPanel achievementDict={achievementDict} />

      <div className="editor-cards">
        <AchievementEditor
          achievementDict={achievementDict}
          achievementModalDict={achievementModalDict}
        />
      </div>
    </div>
  );
}

export default AchievementControl;
