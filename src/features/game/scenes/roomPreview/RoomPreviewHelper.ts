import { roomDefaultCode } from './RoomPreviewConstants';
import { Assessment, IProgrammingQuestion } from 'src/commons/assessment/AssessmentTypes';
import { AccountInfo } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { getAssessment } from 'src/commons/sagas/RequestsSaga';

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
