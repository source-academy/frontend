import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext, useReducer, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { FilterStatus } from 'src/features/achievement/AchievementTypes';
import { generateAchievementTasks } from 'src/pages/achievement/subcomponents/AchievementDashboard';

import AchievementView from '../AchievementView';

type Props = {
  awaitPublish: boolean;
  publishChanges: () => void;
};

const AchievementPreview: React.FC<Props> = ({ awaitPublish, publishChanges }) => {
  const inferencer = useContext(AchievementContext);

  // Show AchievementView when viewMode is true, otherwise show AchievementTask
  const [viewMode, toggleMode] = useReducer(mode => !mode, false);

  /**
   * Marks the achievement uuid that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState('');
  const [focusUuid] = focusState;

  return (
    <div className="achievement-preview">
      <div className="command">
        <Button
          className="command-button"
          icon={viewMode && IconNames.ARROW_LEFT}
          rightIcon={!viewMode && IconNames.ARROW_RIGHT}
          text={viewMode ? 'Task' : 'View'}
          onClick={toggleMode}
        />
        {awaitPublish && (
          <Button
            className="command-button"
            icon={IconNames.CLOUD_UPLOAD}
            intent="primary"
            text="Publish Changes"
            onClick={publishChanges}
          />
        )}
      </div>
      {viewMode ? (
        <div className="preview-container">
          <AchievementView focusUuid={focusUuid} />
        </div>
      ) : (
        <ul className="preview-container">
          {generateAchievementTasks(inferencer.listSortedTaskUuids(), FilterStatus.ALL, focusState)}
        </ul>
      )}
    </div>
  );
};

export default AchievementPreview;
