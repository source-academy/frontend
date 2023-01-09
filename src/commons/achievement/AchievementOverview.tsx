import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AchievementUser } from 'src/features/achievement/AchievementTypes';

import { FETCH_TOTAL_XP, FETCH_TOTAL_XP_ADMIN } from '../application/types/SessionTypes';
import { useTypedSelector } from '../utils/Hooks';
import AchievementLevel from './overview/AchievementLevel';

type AchievementOverviewProps = {
  name: string;
  userState: [AchievementUser | undefined, any];
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name, userState } = props;
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
}

export default AchievementOverview;
