import { Button } from '@blueprintjs/core';
import React from 'react';

import AchievementInferencer from '../../../utils/AchievementInferencer';
import { achievementTemplate } from '../AchievementTemplate';

type AchievementAdderProps = {
  inferencer: AchievementInferencer;
  admitId: (id: number) => void;
  isHoldingId: boolean;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { inferencer, admitId, isHoldingId } = props;

  /**
   * Create a template achievement and hold the new achievementId as controlId.
   * The controlId will only get released when the temporary achievement is updated
   * and saved into the AchievementInferencer
   */
  const handleAddAchievement = () => admitId(inferencer.insertAchievement(achievementTemplate));

  return (
    <Button
      className="main-adder"
      onClick={handleAddAchievement}
      text={'Add A New Item'}
      disabled={isHoldingId}
    />
  );
}

export default AchievementAdder;
