import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import defaultCoverImage from '../../../assets/default_cover_image.jpg';
import AchievementCategory from './subcomponents/AchievementCategory';
import AchievementTask from './subcomponents/AchievementTask';

export type DispatchProps = {};

export type StateProps = {};

function Achievement() {
  const [achievementModal, setAchievementModal] = useState(null);

  const resetModal = () => {
    setAchievementModal(null);
  };

  return (
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
          <AchievementCategory category={'ALL'} icon={IconNames.GLOBE} missions={22} />
          <AchievementCategory category={'ACTIVE'} icon={IconNames.LOCATE} missions={15} />
          <AchievementCategory category={'COMPLETED'} icon={IconNames.ENDORSED} missions={7} />
        </div>

        <div className="cards">
          <ul>
            <AchievementTask
              hasDropdown={true}
              icon={IconNames.PREDICTIVE_ANALYSIS}
              modalImageURL={defaultCoverImage}
              resetModal={resetModal}
              setModal={setAchievementModal}
            />

            <AchievementTask
              hasDropdown={false}
              icon={IconNames.PREDICTIVE_ANALYSIS}
              modalImageURL={'http://robohash.org/set_set3/bgset_bg2/bWYZFB0dVgz'}
              resetModal={resetModal}
              setModal={setAchievementModal}
            />
          </ul>
        </div>

        {achievementModal}
      </div>
    </div>
  );
}

export default Achievement;
