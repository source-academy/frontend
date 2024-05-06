import '@tremor/react/dist/esm/tremor.css';

import { Button } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Form, useParams } from 'react-router-dom';
import Select, { ActionMeta, MultiValue } from 'react-select';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { User } from 'src/commons/application/types/SessionTypes';
import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { useSession } from 'src/commons/utils/Hooks';
import { TeamFormationOverview } from 'src/features/teamFormation/TeamFormationTypes';
import classes from 'src/styles/TeamFormation.module.scss';

export type OptionType = {
  label: string | null;
  value: User | null;
} | null;

const TeamFormationForm: React.FC = () => {
  const { teamId } = useParams(); // Retrieve the team ID from the URL
  const { courseId, students, assessmentOverviews, teamFormationOverviews } = useSession();
  const dispatch = useDispatch();
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentOverview | undefined>(
    undefined
  );
  const [teams, setTeams] = useState<OptionType[][]>([[]]);
  const navigate = useNavigate();

  let maxNoOfStudents: number | undefined = selectedAssessment ? selectedAssessment.maxTeamSize : 0;

  useEffect(() => {
    if (teamId) {
      const existingTeam: TeamFormationOverview | undefined = teamFormationOverviews?.find(
        team => team.teamId.toString() === teamId
      );

      if (existingTeam) {
        const existingAssessment: AssessmentOverview | undefined = assessmentOverviews?.find(
          assessment => assessment.id === existingTeam.assessmentId
        );
        setSelectedAssessment(existingAssessment);

        const existingTeams: OptionType[][] = existingTeam.studentIds
          .map(
            _ =>
              students
                ?.filter(student => existingTeam.studentIds.includes(student.userId))
                .map(student => ({
                  label: student.name,
                  value: student
                })) as OptionType[]
          )
          .slice(0, 1);
        setTeams(existingTeams);
      }
    }
  }, [assessmentOverviews, students, teamFormationOverviews, teamId]);

  const handleTeamChange = (
    index: number,
    selectedOption: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
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
    <div className={classes['form-container']}>
      <Form>
        <h2>{teamId ? 'Edit' : 'Create New'} Team</h2>
        <div className={classes['form-field-row']}>
          <div className={classes['form-field']}>
            <label htmlFor="assessment" className={classes['form-label']}>
              Assessment
            </label>
            <Select
              id="assessment"
              options={assessmentOverviews?.map(assessment => ({
                label: assessment.title,
                value: assessment
              }))}
              value={
                selectedAssessment
                  ? { label: selectedAssessment.title, value: selectedAssessment }
                  : null
              }
              onChange={option => handleAssessmentChange(option?.value)}
              isSearchable
              className={classes['form-select']}
            />
          </div>
          {selectedAssessment && (
            <div className={classes['form-field']}>
              <label className={classes['form-label']}>Max No. of Students:</label>
              <input
                type="text"
                className={classes['form-select']}
                value={maxNoOfStudents}
                readOnly
                disabled // Make the input read-only and disabled
              />
            </div>
          )}
        </div>

        {teams.map((t, index) => (
          <div className={classes['student-form-field']} key={index}>
            <label htmlFor={`team-${index}`} className={classes['form-label']}>
              Students
            </label>
            <div className={classes['input-container']}>
              <Select
                id={`team-${index}`}
                options={students?.map(student => ({
                  label: student.name,
                  value: student
                }))}
                isMulti
                isSearchable
                value={t}
                onChange={(
                  selectedOption: MultiValue<OptionType>,
                  actionMeta: ActionMeta<OptionType>
                ) => handleTeamChange(index, selectedOption, actionMeta)}
                className={classes['form-select']}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeTeam(index)}
                  className={classes['remove-button']}
                >
                  Remove Team
                </button>
              )}
            </div>
          </div>
        ))}
        {!teamId ? (
          <Button onClick={addAnotherTeam} intent="primary">
            Add Another Team
          </Button>
        ) : null}

        <div className={classes['form-footer']}>
          <Button onClick={backToTeamDashboard} intent="danger">
            Back
          </Button>

          <div>
            <Button onClick={submitForm} intent="success">
              Submit
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = TeamFormationForm;
Component.displayName = 'TeamFormationForm';

export default TeamFormationForm;
