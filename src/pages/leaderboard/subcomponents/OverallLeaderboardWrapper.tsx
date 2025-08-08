import React, { useEffect, useState } from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import NotFound from '../../notFound/NotFound';
import OverallLeaderboard from './OverallLeaderboard';

const OverallLeaderboardWrapper: React.FC = () => {
  const enableOverallLeaderboard = useTypedSelector(
    store => store.session.enableOverallLeaderboard
  );

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for enableOverallLeaderboard to be resolved or loaded
    if (enableOverallLeaderboard !== undefined) {
      setIsReady(true);
    }
  }, [enableOverallLeaderboard]);

  if (!isReady || !enableOverallLeaderboard) {
    return <NotFound />;
  }

  if (!enableOverallLeaderboard) {
    return <NotFound />;
  } else {
    return <OverallLeaderboard />;
  }
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = OverallLeaderboardWrapper;
Component.displayName = 'OverallLeaderboardWrapper';

export default OverallLeaderboardWrapper;
