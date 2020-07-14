import { Assessment, IProgrammingQuestion } from 'src/commons/assessment/AssessmentTypes';
import { getAssessment } from 'src/commons/sagas/RequestsSaga';
import { AccountInfo } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import FontAssets from '../../assets/FontAssets';
import GameCollectiblesManager from '../../collectibles/GameCollectiblesManager';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { HexColor } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import { roomDefaultCode } from './RoomPreviewConstants';

export async function getRoomPreviewCode(accInfo: AccountInfo) {
  const roomMissionId = getRoomMissionId();
  const mission = await getAssessment(roomMissionId, {
    accessToken: accInfo.accessToken,
    refreshToken: accInfo.refreshToken
  });
  const studentCode = getStudentRoomCode(mission);
  return studentCode;
}

function getRoomMissionId() {
  // TODO: Change to non-hardcode
  return 405;
}

function getStudentRoomCode(mission: Assessment | null) {
  if (mission) {
    const progQn = mission.questions[0] as IProgrammingQuestion;
    const answer = progQn.answer;
    return answer ? (answer as string) : progQn.solutionTemplate;
  }
  return roomDefaultCode;
}

export const createCMRGamePhases = (
  escapeMenu: GameEscapeManager,
  collectibleMenu: GameCollectiblesManager
) => {
  return new Map([
    [GamePhaseType.None, new GameModeSequence()],
    [GamePhaseType.EscapeMenu, escapeMenu],
    [GamePhaseType.CollectibleMenu, collectibleMenu]
  ]);
};

const verifiedStyle: BitmapFontStyle = {
  key: FontAssets.educatedDeersFont.key,
  size: 40,
  fill: HexColor.paleYellow,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
const verifiedText = 'VERIFIED';
const startTextXPos = verifiedText.length * verifiedStyle.size * 0.4;

export const createVerifiedHoverContainer = (scene: Phaser.Scene) => {
  const hoverContainer = new Phaser.GameObjects.Container(scene, 0, 0);
  const hoverTextBg = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    startTextXPos,
    verifiedStyle.size * 1.5,
    HexColor.darkBlue
  )
    .setOrigin(0.0, 0.5)
    .setAlpha(0.8);

  const hoverText = createBitmapText(scene, verifiedText, 0, 0, verifiedStyle)
    .setOrigin(0.0, 0.35)
    .setPosition(startTextXPos, 0);
  const shape = new Phaser.GameObjects.Graphics(scene);
  shape.fillRect(hoverTextBg.x, hoverTextBg.y, hoverTextBg.width, hoverTextBg.height);
  hoverText.setMask(shape.createGeometryMask());

  scene.tweens.add({
    targets: hoverText,
    x: -startTextXPos,
    duration: 3000,
    ease: 'Power0',
    loop: -1,
    onLoop: () => (hoverText.x = startTextXPos + 50)
  });

  hoverContainer.add([hoverTextBg, hoverText]);
  // hoverContainer.setVisible(false);
  return hoverContainer;
};
