import { Assessment, IProgrammingQuestion } from 'src/commons/assessment/AssessmentTypes';
import { getAssessment } from 'src/commons/sagas/RequestsSaga';
import { AccountInfo } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import GameCollectiblesManager from '../../collectibles/GameCollectiblesManager';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { HexColor } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import RoomPreview from './RoomPreview';
import {
  roomDefaultCode,
  startTextXPos,
  verifiedStyle,
  verifiedText
} from './RoomPreviewConstants';

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

/**
 * Create a verification container and its mask.
 *
 * @param scene room preview scene
 * @returns {[Phaser.GameObjects.Container, Phaser.GameObjects.Graphics]} verification container, and its mask
 */
export const createVerifiedHoverContainer = (scene: RoomPreview) => {
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

  const hoverMask = new Phaser.GameObjects.Graphics(scene)
    .fillRect(
      hoverTextBg.x - hoverTextBg.height * hoverTextBg.originX * 0.5,
      hoverTextBg.y - hoverTextBg.width * hoverTextBg.originY * 0.5,
      hoverTextBg.width,
      hoverTextBg.height
    )
    .setAlpha(0);

  const hoverText = createBitmapText(scene, verifiedText, 0, 0, verifiedStyle)
    .setOrigin(0.0, 0.35)
    .setPosition(startTextXPos, 0);

  scene.tweens.add({
    targets: hoverText,
    x: -startTextXPos,
    duration: 3000,
    ease: 'Power0',
    loop: -1,
    onLoop: () => (hoverText.x = startTextXPos + 50)
  });

  hoverContainer.add([hoverTextBg, hoverText]);
  hoverContainer.setMask(hoverMask.createGeometryMask());
  hoverContainer.setVisible(false);
  return [hoverContainer, hoverMask];
};
