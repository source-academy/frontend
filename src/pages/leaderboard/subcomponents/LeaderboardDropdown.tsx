import 'src/styles/Leaderboard.scss';

import React, { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';

const LeaderboardDropdown: React.FC = () => {
  const enableOverallLeaderboard = useTypedSelector(
    store => store.session.enableOverallLeaderboard
  );
  const enableContestLeaderboard = useTypedSelector(
    store => store.session.enableContestLeaderboard
  );
  const crid = useTypedSelector(store => store.session.courseId);
  const baseLink = `/courses/${crid}/leaderboard`;

  // Handle Navigation to other contest leaderboards
  const navigate = useNavigate();
  const location = useLocation();
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    navigate(selectedValue);
  };

  const currentPath = location.pathname;
  const contests = useTypedSelector(state => state.leaderboard.contests);
  const publishedContests = enableContestLeaderboard
    ? contests.filter(contest => contest.published)
    : [];

  return (
    <select className="dropdown" onChange={handleChange} value={currentPath}>
      {enableOverallLeaderboard && <option value={`${baseLink}/overall`}>Overall XP</option>}
      {enableContestLeaderboard &&
        publishedContests.map(({ title, contest_id: id }) => (
          <Fragment key={id}>
            <option value={`${baseLink}/contests/${id}/score`}>{title} (Score)</option>
            <option value={`${baseLink}/contests/${id}/popularvote`}>{title} (Popular Vote)</option>
          </Fragment>
        ))}
    </select>
  );
};

export default LeaderboardDropdown;
