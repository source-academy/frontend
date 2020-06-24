import * as React from 'react';
import {
  createSourceAcademyGame,
  getSourceAcademyGame,
  AccountInfo
} from './subcomponents/sourceAcademyGame';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';

function Game() {
  const session = useSelector((state: OverallState) => state.session);
  const [sessionLoaded, setSessionLoaded] = React.useState(false);

  React.useEffect(() => {
    createSourceAcademyGame();
  }, []);

  React.useEffect(() => {
    if (sessionLoaded || !session) {
      return;
    }

    getSourceAcademyGame().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    } as AccountInfo);

    setSessionLoaded(true);
  }, [sessionLoaded, session]);

  return (
    <>
      <div id="game-display">
        <div id="phaser-div" />
      </div>
    </>
  );
}

export default Game;
