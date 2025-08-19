import 'src/styles/Leaderboard.scss';

import React from 'react';
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
    <>
      {/* Leaderboard Options Dropdown */}
      <select className="dropdown" onChange={handleChange} value={currentPath}>
        {
          // Overall Leaderboard Option
          enableOverallLeaderboard ? (
            <option key="overall" value={`${baseLink}`}>
              Overall XP
            </option>
          ) : null
        }

        {enableContestLeaderboard &&
          publishedContests.map(contest => (
            <>
              <option
                key={`${contest.contest_id}-score`}
                value={`${baseLink}/contests/${contest.contest_id}/score`}
              >
                {contest.title} (Score)
              </option>
              <option
                key={`${contest.contest_id}-popularvote`}
                value={`${baseLink}/contests/${contest.contest_id}/popularvote`}
              >
                {contest.title} (Popular Vote)
              </option>
            </>
          ))}
      </select>
    </>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LeaderboardDropdown;
Component.displayName = 'LeaderboardDropdown';

export default LeaderboardDropdown;
