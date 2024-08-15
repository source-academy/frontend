import { OptionType } from 'src/pages/academy/teamFormation/subcomponents/TeamFormationForm';

import { TeamFormationOverview } from '../../features/teamFormation/TeamFormationTypes';
import { Role } from '../application/ApplicationTypes';
import { mockFetchRole, mockFetchStudents } from './UserMocks';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require('xlsx');

export const mockTeamFormationOverviews: TeamFormationOverview[] = [
  {
    teamId: 1,
    assessmentId: 1,
    assessmentName: 'An Odessey to Runes',
    assessmentType: 'Missions',
    studentIds: [106, 107, 108, 109],
    studentNames: ['Lolita Sim', 'Lim Jun Ming', 'Tobias Gray', 'Lenard Toh See Ming']
  },
  {
    teamId: 2,
    assessmentId: 2,
    assessmentName: 'An Odessey to Runes',
    assessmentType: 'Missions',
    studentIds: [110, 111, 112, 113],
    studentNames: ['Richard Gray', 'Benedict Lim', 'Harshvathini Tharman', 'James Cook']
  },
  {
    teamId: 3,
    assessmentId: 2,
    assessmentName: 'An Odessey to Runes',
    assessmentType: 'Missions',
    studentIds: [114, 115, 116, 117],
    studentNames: ['Mike Chang', 'Giyu Tomioka', 'Oliver Sandy', 'Muthu Valakrishnan']
  }
];

/**
 * Mock for fetching a trainer/admin's student grading information.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param group a boolean if true, only fetches submissions from the grader's group
 */
export const mockFetchTeamFormationOverview = (
  accessToken: string,
  group: boolean
): TeamFormationOverview[] | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    return group
      ? [mockTeamFormationOverviews[0]]
      : mockTeamFormationOverviews.sort(
          (subX: TeamFormationOverview, subY: TeamFormationOverview) =>
            subY.assessmentId - subX.assessmentId
        );
  }
};

/**
 * Mock for creating a team.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param assessmentId the id of an existing assessment
 * @param studentIds the ids of existing students
 */
export const mockCreateTeam = (
  accessToken: string,
  assessmentId: number,
  assessmentName: string,
  assessmentType: string,
  teams: OptionType[][]
): TeamFormationOverview[] | null => {
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    const lastTeam = mockTeamFormationOverviews[mockTeamFormationOverviews.length - 1];
    let teamId = lastTeam?.teamId + 1;
    const newTeams: TeamFormationOverview[] = teams.map((team: OptionType[]) => {
      const studentNames: string[] = [];
      const studentIds: number[] = [];

      team.forEach((option: OptionType | undefined) => {
        if (option && option.value && typeof option.value.userId === 'number') {
          studentNames.push(option.value.name);
          studentIds.push(option.value.userId);
        }
      });

      return {
        teamId: teamId++,
        assessmentId: assessmentId,
        assessmentName: assessmentName,
        assessmentType: assessmentType,
        studentIds: studentIds,
        studentNames: studentNames
      };
    });

    mockTeamFormationOverviews.push(...newTeams);

    return mockTeamFormationOverviews.sort(
      (subX: TeamFormationOverview, subY: TeamFormationOverview) =>
        subY.assessmentId - subX.assessmentId
    );
  }
};

type CsvData = string[][];
/**
 * Mock for creating a team.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param assessmentId the id of an existing assessment
 * @param studentIds the ids of existing students
 */
export const mockBulkUploadTeam = async (
  accessToken: string,
  assessmentId: number,
  assessmentName: string,
  assessmentType: string,
  teamsFile: File
): Promise<TeamFormationOverview[] | null> => {
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    const teamsArrayBuffer = await readFileAsArrayBuffer(teamsFile);
    const workbook = XLSX.read(teamsArrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csvData: CsvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const newTeams: TeamFormationOverview[] = [];
    let teamId =
      mockTeamFormationOverviews.length > 0
        ? mockTeamFormationOverviews[mockTeamFormationOverviews.length - 1].teamId + 1
        : 1;
    const students = mockFetchStudents(accessToken);

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const team: OptionType[] = [];
      row.forEach((username: string) => {
        const student = students?.find((s: any) => s.username.trim() === username.trim());
        if (student) {
          team.push({
            label: student.name,
            value: student
          });
        }
      });

      const studentNames: string[] = [];
      const studentIds: number[] = [];

      team.forEach((option: OptionType | undefined) => {
        if (option && option.value && typeof option.value.userId === 'number') {
          studentNames.push(option.value.name);
          studentIds.push(option.value.userId);
        }
      });

      newTeams.push({
        teamId: teamId++,
        assessmentId: assessmentId,
        assessmentName: assessmentName,
        assessmentType: assessmentType,
        studentIds: studentIds,
        studentNames: studentNames
      });
    }

    mockTeamFormationOverviews.push(...newTeams);

    return mockTeamFormationOverviews.sort(
      (subX: TeamFormationOverview, subY: TeamFormationOverview) =>
        subY.assessmentId - subX.assessmentId
    );
  }
};

const readFileAsArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target) {
        const result = event.target.result as ArrayBuffer;
        resolve(result);
      } else {
        reject(new Error('Error reading file'));
      }
    };
    reader.onerror = event => {
      reject(new Error('Error reading file'));
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Mock for creating a team.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param teamId the id of an existing team
 * @param assessmentId the id of an existing assessment
 * @param studentIds the ids of existing students
 */
export const mockUpdateTeam = (
  accessToken: string,
  teamId: number,
  assessmentId: number,
  assessmentName: string,
  assessmentType: string,
  teams: OptionType[][]
): TeamFormationOverview[] | null => {
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  } else {
    const teamIndex = mockTeamFormationOverviews.findIndex(team => team.teamId === teamId);

    if (teamIndex !== -1) {
      mockTeamFormationOverviews[teamIndex].assessmentId = assessmentId;
      mockTeamFormationOverviews[teamIndex].assessmentName = assessmentName;
      mockTeamFormationOverviews[teamIndex].assessmentType = assessmentType;

      const studentIds: number[] = [];
      const studentNames: string[] = [];

      teams.forEach(team => {
        team.forEach(option => {
          if (option && option.value && typeof option.value.userId === 'number') {
            studentIds.push(option.value.userId);
            studentNames.push(option.value.name);
          }
        });
      });

      mockTeamFormationOverviews[teamIndex].studentIds = studentIds;
      mockTeamFormationOverviews[teamIndex].studentNames = studentNames;
    }

    return mockTeamFormationOverviews.sort(
      (subX: TeamFormationOverview, subY: TeamFormationOverview) =>
        subY.assessmentId - subX.assessmentId
    );
  }
};

/**
 * Mock function for deleting a team.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 * @param teamId a valid id of an existing team
 */
export const mockDeleteTeam = (
  accessToken: string,
  teamId: number
): TeamFormationOverview[] | null => {
  const permittedRoles: Role[] = [Role.Admin, Role.Staff];
  const role: Role | null = mockFetchRole(accessToken);
  if (role === null || !permittedRoles.includes(role)) {
    return null;
  }

  const teamIndex = mockTeamFormationOverviews.findIndex(team => team.teamId === teamId);

  if (teamIndex !== -1) {
    mockTeamFormationOverviews.splice(teamIndex, 1);
  }

  return mockTeamFormationOverviews;
};
