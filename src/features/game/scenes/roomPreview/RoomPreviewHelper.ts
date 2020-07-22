import { Assessment, IProgrammingQuestion } from 'src/commons/assessment/AssessmentTypes';
import { getAssessment } from 'src/commons/sagas/RequestsSaga';

import ImageAssets from '../../assets/ImageAssets';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { HexColor } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import RoomPreview from './RoomPreview';
import { roomConstants, roomDefaultCode, verifiedStyle } from './RoomPreviewConstants';

/**
 * Async function that obtains students code for Create-My-Room mission
 *
 * @param {AccountInfo} accInfo - students' account information
 * @returns {Promise<string>} - promise of students code
 */
export async function getRoomPreviewCode(): Promise<string> {
  const roomMissionId = getRoomMissionId();
  const mission = await getAssessment(
    roomMissionId,
    SourceAcademyGame.getInstance().getAccountInfo()
  );
  const studentCode = getStudentRoomCode(mission);
  return studentCode;
}

/**
 * Function that generates the correct mission id of students
 *
 * @param {AccountInfo} accInfo - students' account information
 */
function getRoomMissionId() {
  // TODO: Change to non-hardcode
  return 405;
}

/**
 * Fetches the student code based on the mission.
 * If student has not attempted the mission; will return
 * the answer template instead.
 *
 * If the mission is invalid (e.g. invalid ID, typo), the
 * default code for the room will be returned instead.
 *
 * @param mission
 */
function getStudentRoomCode(mission: Assessment | null) {
  if (mission) {
    const progQn = mission.questions[0] as IProgrammingQuestion;
    const answer = progQn.answer;
    return answer ? (answer as string) : progQn.solutionTemplate;
  }
  return roomDefaultCode;
}

/**
 * CMR Game Phases for the phase manager.
 *
 * @param escapeMenu escape menu tied to CMR
 * @param awardMenu award menu tied to CMR
 */
export const createCMRGamePhases = () => {
  return new Map([[GamePhaseType.None, new GameModeSequence()]]);
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
    roomConstants.tagWidth,
    roomConstants.tagHeight,
    HexColor.darkBlue
  )
    .setOrigin(0.0, 0.5)
    .setAlpha(0.8);
  const hoverTextFrame = new Phaser.GameObjects.Sprite(
    scene,
    0,
    0,
    ImageAssets.verifiedFrame.key
  ).setOrigin(0.0, 0.5);

  const hoverMask = new Phaser.GameObjects.Graphics(scene)
    .fillRect(
      hoverTextBg.x - hoverTextBg.height * hoverTextBg.originX * 0.5,
      hoverTextBg.y - hoverTextBg.width * hoverTextBg.originY * 0.5,
      hoverTextBg.width,
      hoverTextBg.height
    )
    .setAlpha(0);

  const hoverText = createBitmapText(
    scene,
    roomConstants.verifiedText,
    roomConstants.hoverTagTextConfig,
    verifiedStyle
  )
    .setPosition(roomConstants.startTextXPos, 0)
    .setMask(hoverMask.createGeometryMask());

  scene.tweens.add({
    targets: hoverText,
    x: -roomConstants.startTextXPos,
    duration: 5000,
    ease: 'Power0',
    loop: -1,
    onLoop: () => (hoverText.x = roomConstants.startTextXPos + 50)
  });

  hoverContainer.add([hoverTextBg, hoverText, hoverTextFrame]);
  hoverContainer.setVisible(false);
  return [hoverContainer, hoverMask];
};
