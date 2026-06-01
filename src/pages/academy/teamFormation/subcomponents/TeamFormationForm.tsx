import { Button } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import type { ActionMeta, MultiValue } from 'react-select';
import Select from 'react-select';
import SessionActions from 'src/commons/application/actions/SessionActions';
import type { User } from 'src/commons/application/types/SessionTypes';
import type { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { useSession } from 'src/commons/utils/Hooks';
import {
  FormContainer,
  FormField,
  FormFieldRow,
  FormFooter,
  InputContainer,
  RemoveButton,
  StudentFormField,
} from 'src/components/ui/form';
import type { TeamFormationOverview } from 'src/features/teamFormation/TeamFormationTypes';

export type OptionType = {
  label: string | null;
  value: User | null;
} | null;

function TeamFormationForm() {
  const { teamId } = useParams();
  const { courseId, students, assessmentOverviews, teamFormationOverviews } = useSession();
  const dispatch = useDispatch();
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentOverview | undefined>(
    undefined,
  );
  const [teams, setTeams] = useState<OptionType[][]>([[]]);
  const navigate = useNavigate();

  let maxNoOfStudents: number | undefined = selectedAssessment ? selectedAssessment.maxTeamSize : 0;

  useEffect(() => {
    if (teamId) {
      const existingTeam: TeamFormationOverview | undefined = teamFormationOverviews?.find(
        team => team.teamId.toString() === teamId,
      );

      if (existingTeam) {
        const existingAssessment: AssessmentOverview | undefined = assessmentOverviews?.find(
          assessment => assessment.id === existingTeam.assessmentId,
        );
        setSelectedAssessment(existingAssessment);

        const existingTeams: OptionType[][] = existingTeam.studentIds
          .map(
            _ =>
              students
                ?.filter(student => existingTeam.studentIds.includes(student.userId))
                .map(student => ({
                  label: student.name,
                  value: student,
                })) as OptionType[],
          )
          .slice(0, 1);
        setTeams(existingTeams);
      }
    }
  }, [assessmentOverviews, students, teamFormationOverviews, teamId]);

  const handleTeamChange = (
    index: number,
    selectedOption: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>,
  ) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = selectedOption as unknown as OptionType[];
    setTeams(updatedTeams);
  };

  const addAnotherTeam = () => {
    setTeams([...teams, []]);
  };

  const removeTeam = (index: number) => {
    const updatedTeams = [...teams];
    updatedTeams.splice(index, 1);
    setTeams(updatedTeams);
  };

  const backToTeamDashboard = () => {
    navigate(`/courses/${courseId}/teamformation`);
  };

  const handleAssessmentChange = (assessment: AssessmentOverview | undefined) => {
    setSelectedAssessment(assessment);
    maxNoOfStudents = assessment?.maxTeamSize;
  };

  const submitForm = () => {
    if (!selectedAssessment) {
      alert('Please select an assessment.');
      return;
    }

    const hasEmptyTeam = teams.some(team => team.length === 0);
    if (hasEmptyTeam) {
      alert('Each team must have at least one student.');
      return;
    }

    const isTeamSizeExceeded = teams.some(team => team.length > selectedAssessment.maxTeamSize);
    if (isTeamSizeExceeded) {
      alert('The number of students in a team cannot exceed the max team size.');
      return;
    }

    if (teamId) {
      dispatch(SessionActions.updateTeam(parseInt(teamId, 10), selectedAssessment, teams));
    } else {
      dispatch(SessionActions.createTeam(selectedAssessment, teams));
    }
    navigate(`/courses/${courseId}/teamformation`);
  };

  return (
    <FormContainer heading={teamId ? 'Edit' : 'Create New'}>
      <FormFieldRow>
        <FormField label="Assessment" htmlFor="assessment">
          <Select
            id="assessment"
            options={assessmentOverviews?.map(assessment => ({
              label: assessment.title,
              value: assessment,
            }))}
            value={
              selectedAssessment
                ? { label: selectedAssessment.title, value: selectedAssessment }
                : null
            }
            onChange={option => handleAssessmentChange(option?.value)}
            isSearchable
          />
        </FormField>
        {selectedAssessment && (
          <FormField label="Max No. of Students:">
            <input
              type="text"
              className="flex-1 w-full h-9 rounded text-sm transition-all"
              value={maxNoOfStudents}
              readOnly
              disabled
            />
          </FormField>
        )}
      </FormFieldRow>

      {teams.map((t, index) => (
        <StudentFormField label="Students" htmlFor={`team-${index}`} key={index}>
          <InputContainer>
            <Select
              id={`team-${index}`}
              options={students?.map(student => ({
                label: student.name,
                value: student,
              }))}
              isMulti
              isSearchable
              value={t}
              onChange={(
                selectedOption: MultiValue<OptionType>,
                actionMeta: ActionMeta<OptionType>,
              ) => handleTeamChange(index, selectedOption, actionMeta)}
            />
            {index > 0 && (
              <RemoveButton onClick={() => removeTeam(index)}>Remove Team</RemoveButton>
            )}
          </InputContainer>
        </StudentFormField>
      ))}
      {!teamId ? (
        <Button onClick={addAnotherTeam} intent="primary">
          Add Another Team
        </Button>
      ) : null}

      <FormFooter>
        <Button onClick={backToTeamDashboard} intent="danger">
          Back
        </Button>

        <div>
          <Button onClick={submitForm} intent="success">
            Submit
          </Button>
        </div>
      </FormFooter>
    </FormContainer>
  );
}

export const Component = TeamFormationForm;

export default TeamFormationForm;
