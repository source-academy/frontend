import { Assessment, IProgrammingQuestion } from 'src/commons/assessment/AssessmentTypes';
import { getAssessment, getAssessmentOverviews } from 'src/commons/sagas/RequestsSaga';

import ImageAssets from '../../assets/ImageAssets';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { HexColor } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import RoomPreview from './RoomPreview';
import { RoomConstants, roomDefaultCode, verifiedStyle } from './RoomPreviewConstants';

/**
 * Async function that obtains students code for Create-My-Room mission
 *
 * @param {AccountInfo} accInfo - students' account information
 * @returns {Promise<string>} - promise of students code
 */
export async function getRoomPreviewCode(): Promise<string> {
  const roomAssessmentId = await getRoomAssessmentId();
  if (!roomAssessmentId) {
    // Get default room code.
    return getStudentRoomCode(null);
  }
  const mission = await getAssessment(
    roomAssessmentId,
    SourceAcademyGame.getInstance().getAccountInfo()
  );
  const studentCode = getStudentRoomCode(mission);
  return studentCode;
}

/**
 * Function that generates the correct assessment id of students
 *
 * @param {AccountInfo} accInfo - students' account information
 */
async function getRoomAssessmentId() {
  const assessments = await getAssessmentOverviews(
    SourceAcademyGame.getInstance().getAccountInfo()
  );
  const roomAssessment = (assessments || []).find(
    assessment => assessment.number === RoomConstants.assessmentNumber
  );
  return roomAssessment ? roomAssessment.id : null;
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
 */
export const createCMRGamePhases = () => {
  return new Map([[GamePhaseType.None, new GameModeSequence()]]);
};

/**
 * Create a verification container.
 *
 * @param scene room preview scene
 * @returns {Phaser.GameObjects.Container} verification container
 */
export const createVerifiedHoverContainer = (scene: RoomPreview) => {
  const hoverContainer = new Phaser.GameObjects.Container(scene, 0, 0);

  const hoverTextBg = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    RoomConstants.tag.width,
    RoomConstants.tag.height,
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

  const hoverLine = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    -hoverTextBg.height * 0.5,
    hoverTextBg.width,
    hoverTextBg.height * 0.05,
    HexColor.offWhite
  ).setOrigin(0.0, 0.0);

  const hoverText = createBitmapText(
    scene,
    RoomConstants.verifiedText,
    RoomConstants.hoverTagTextConfig,
    verifiedStyle
  ).setBlendMode(Phaser.BlendModes.DIFFERENCE);

  scene.tweens.add({
    targets: hoverLine,
    alpha: 0.2,
    y: hoverTextBg.height * 0.35,
    duration: 2000,
    ease: 'Power0',
    yoyo: true,
    loop: -1
  });

  hoverContainer.add([hoverTextBg, hoverText, hoverLine, hoverTextFrame]);
  hoverContainer.setVisible(false);
  return hoverContainer;
};
