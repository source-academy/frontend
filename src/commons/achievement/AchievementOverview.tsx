import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FETCH_TOTAL_XP, FETCH_TOTAL_XP_ADMIN } from 'src/commons/application/types/SessionTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { AchievementUser } from 'src/features/achievement/AchievementTypes';

import AchievementLevel from './overview/AchievementLevel';

type AchievementOverviewProps = {
  name: string;
  userState: [AchievementUser | undefined, any];
};

const AchievementOverview: React.FC<AchievementOverviewProps> = ({ name, userState }) => {
  const [selectedUser] = userState;
  const crid = selectedUser?.courseRegId;
  const userCrid = useTypedSelector(store => store.session.courseRegId);

  const dispatch = useDispatch();
  useEffect(() => {
    // If user is student, fetch assessment details from assessment route instead, as seen below
    if (crid && crid !== userCrid) {
      dispatch({ type: FETCH_TOTAL_XP_ADMIN, payload: crid });
    } else {
      dispatch({ type: FETCH_TOTAL_XP });
    }
  }, [crid, userCrid, dispatch]);

  const studentXp = useTypedSelector(store => store.session.xp);

  return (
    <div className="achievement-overview">
      <AchievementLevel studentXp={studentXp} />
      <h3>{name}</h3>
    </div>
  );
};

export default AchievementOverview;
