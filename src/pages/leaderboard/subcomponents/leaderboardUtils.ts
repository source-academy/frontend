import { LoaderFunction, redirect, replace } from 'react-router';
import { store } from 'src/pages/createStore';

export const leaderboardLoader: LoaderFunction = ({ request, params }) => {
  const baseUrl = `/courses/${params.courseId}`;
  const { enableOverallLeaderboard, enableContestLeaderboard } = store.getState().session;
  if (!enableOverallLeaderboard && !enableContestLeaderboard) {
    return redirect(baseUrl + '/not_found');
  }
  // If if it a sub-path, pass through transparently
  const path = new URL(request.url).pathname;
  const rootRegex = new RegExp(`^${baseUrl}/leaderboard/?$`);
  if (!rootRegex.test(path)) {
    // Don't try to redirect subpaths, pass through and proceed
    return null;
  }
  // Prefer showing overall
  return enableOverallLeaderboard
    ? replace(baseUrl + '/leaderboard/overall')
    : replace(baseUrl + '/leaderboard/contests');
};

export const contestLeaderboardLoader: LoaderFunction = ({ request, params }) => {
  const baseUrl = `/courses/${params.courseId}`;
  const { enableContestLeaderboard } = store.getState().session;
  if (!enableContestLeaderboard) {
    return redirect(baseUrl + '/not_found');
  }
  const contests = store.getState().leaderboard.contests;
  const fallback = contests.find(c => c.published);
  if (!fallback) {
    // No contests are ready to show scores yet
    return redirect(baseUrl + '/not_found');
  }
  if (!params.contestId) {
    // Fallback to default contest ID
    // Prefer score leaderboard
    return replace(`${baseUrl}/leaderboard/contests/${fallback.contest_id}/score`);
  }
  const leaderboardType = params.leaderboardType!;
  if (!['score', 'popularvote'].includes(leaderboardType)) {
    return redirect(baseUrl + '/not_found');
  }
  // Pass through and proceed
  return null;
};
