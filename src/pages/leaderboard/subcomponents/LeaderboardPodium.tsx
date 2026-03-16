import 'src/styles/Leaderboard.scss';

import React from 'react';
import { ContestLeaderboardRow, LeaderboardRow } from 'src/features/leaderboard/LeaderboardTypes';

type Props =
  | { type: 'overall'; data: LeaderboardRow[]; outputType: undefined }
  | { type: 'contest'; data: ContestLeaderboardRow[]; outputType: 'image' }
  | { type: 'contest'; data: ContestLeaderboardRow[]; outputType: 'audio' };

const LeaderboardPodium: React.FC<Props> = ({ type, data, outputType }) => {
  // TODO: Retrieval of rune image/audio files from backend to be displayed on the podium

  return (
    <div className="top-three-podium">
      {data
        .filter(x => x.rank <= 3)
        .slice(0, 3)
        .map((player, index) => (
          <div
            key={player.username}
            className={`top-player ${player.rank === 1 ? 'first' : player.rank === 2 ? 'second' : 'third'}`}
          >
            <p className="player-name">{player.name}</p>
            <div className="player-bar">
              <p className="player-rank">{player.rank}</p>
              <p className="player-xp">
                {type === 'overall'
                  ? (player as LeaderboardRow).xp
                  : (player as ContestLeaderboardRow).score.toFixed(2)}
                {type === 'overall' ? ' XP' : ''}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default LeaderboardPodium;
