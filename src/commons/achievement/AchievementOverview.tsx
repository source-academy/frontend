import { useEffect } from 'react';
import type { AchievementUser } from 'src/features/achievement/AchievementTypes';

import SessionActions from '../application/actions/SessionActions';
import { useAppDispatch, useAppSelector } from '../utils/Hooks';
import AchievementLevel from './overview/AchievementLevel';

type Props = {
  name: string;
  userState: [AchievementUser | undefined, any];
};

function AchievementOverview({ name, userState }: Props) {
  const [selectedUser] = userState;
  const crid = selectedUser?.courseRegId;
  const userCrid = useAppSelector(store => store.session.courseRegId);

  const dispatch = useAppDispatch();
  useEffect(() => {
    // If user is student, fetch assessment details from assessment route instead, as seen below
    if (crid && crid !== userCrid) {
      dispatch(SessionActions.fetchTotalXpAdmin(crid));
    } else {
      dispatch(SessionActions.fetchTotalXp());
    }
  }, [crid, userCrid, dispatch]);

  const studentXp = useAppSelector(store => store.session.xp);

  return (
    <div className="achievement-overview">
      <AchievementLevel studentXp={studentXp} />
      <h3>{name}</h3>
    </div>
  );
}

export default AchievementOverview;
