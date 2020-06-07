import { IonPhaser } from '@ion-phaser/react';
import * as React from 'react';

import phaserGame from 'src/pages/academy/game/subcomponents/phaserGame';

function Game() {
  return (
    <div id="game-display">
      <IonPhaser game={phaserGame} initialize={true} />
    </div>
  );
}

export default Game;
