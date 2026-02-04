import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AchievementUser } from 'src/features/achievement/AchievementTypes';

import SessionActions from '../application/actions/SessionActions';
import { useTypedSelector } from '../utils/Hooks';
import AchievementLevel from './overview/AchievementLevel';

type Props = {
  name: string;
  userState: [AchievementUser | undefined, any];
};

const AchievementOverview: React.FC<Props> = ({ name, userState }) => {
  const [selectedUser] = userState;
  const crid = selectedUser?.courseRegId;
  const userCrid = useTypedSelector(store => store.session.courseRegId);

  const dispatch = useDispatch();
  useEffect(() => {
    // If user is student, fetch assessment details from assessment route instead, as seen below
    if (crid && crid !== userCrid) {
      dispatch(SessionActions.fetchTotalXpAdmin(crid));
    } else {
      dispatch(SessionActions.fetchTotalXp());
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
