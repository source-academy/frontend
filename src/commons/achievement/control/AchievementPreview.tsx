import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { FilterStatus } from 'src/features/achievement/AchievementTypes';
import { generateAchievementTasks } from 'src/pages/achievement/subcomponents/AchievementDashboard';

import AchievementView from '../AchievementView';

type AchievementPreviewProps = {
  awaitPublish: boolean;
  handlePublish: () => void;
};

function AchievementPreview(props: AchievementPreviewProps) {
  const { awaitPublish, handlePublish } = props;

  const inferencer = useContext(AchievementContext);

  // Show AchievementView when viewMode is true, otherwise show AchievementTask
  const [viewMode, setViewMode] = useState<boolean>(false);
  const toggleMode = () => setViewMode(!viewMode);

  /**
   * Marks the achievement id that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState<number>(NaN);
  const [focusId] = focusState;

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
            text={'Publish Changes'}
            onClick={handlePublish}
          />
        )}
      </div>
      {viewMode ? (
        <div className="preview-container">
          <AchievementView focusId={focusId} />
        </div>
      ) : (
        <ul className="preview-container">
          {generateAchievementTasks(
            inferencer.listTaskIdsbyPosition(),
            FilterStatus.ALL,
            focusState
          )}
        </ul>
      )}
    </div>
  );
}

export default AchievementPreview;
