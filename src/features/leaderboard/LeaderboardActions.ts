import { createActions } from "src/commons/redux/utils";
import { LeaderboardRow } from "./LeaderboardTypes";

const LeaderboardActions = createActions('leaderboard', {
    getAllUsersXp: () => ({}),
    saveAllUsersXp: (userXp: LeaderboardRow[]) => userXp
});

export default LeaderboardActions