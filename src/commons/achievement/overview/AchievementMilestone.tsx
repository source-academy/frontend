import React from 'react';

import Constants from '../../utils/Constants';

type Props = {
  studentXp: number;
};

// 36k XP = Level 37
const AchievementMilestone: React.FC<Props> = ({ studentXp }) => {
  return (
    <div className="milestone">
      <h3>Your Total XP</h3>
      <div className="user-xp">{studentXp} XP</div>

      <h3>CA Achievement Level</h3>
      <div className="details">
        <div className="level-badge">
          <span className="level-icon" />
          <p>{Constants.caFulfillmentLevel}</p>
        </div>
        <p className="description">Complete CS1101S CA Component</p>
      </div>
      <div className="footer">
        <p>Full CA level of {Constants.caFulfillmentLevel} is subjected to change.</p>
      </div>
    </div>
  );
};

export default AchievementMilestone;
