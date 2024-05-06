import '@tremor/react/dist/esm/tremor.css';

import { Button } from '@blueprintjs/core';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Form } from 'react-router-dom';
import Select from 'react-select';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import classes from 'src/styles/TeamFormation.module.scss';

const TeamFormationImport: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileTypes = ['XLSX', 'XLS'];
  const [file, setFile] = useState<File | null>(null); // Specify the type of 'file'
  const { courseId, students } = useTypedSelector(state => state.session);
  const assessmentOverviews = useTypedSelector(state => state.session.assessmentOverviews);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentOverview | undefined>(
    undefined
  );
  let maxNoOfStudents: number | undefined = selectedAssessment ? selectedAssessment.maxTeamSize : 0;

  const handleChange = (file: File | null) => {
    setFile(file);
  };

  const backToTeamDashboard = () => {
    navigate(`/courses/${courseId}/teamformation`);
  };

  const handleAssessmentChange = (assessment: AssessmentOverview | undefined) => {
    setSelectedAssessment(assessment);
    maxNoOfStudents = assessment?.maxTeamSize;
  };

  const submitForm = () => {
    // Handle the CSV file submission
    if (!selectedAssessment) {
      alert('Please select an assessment.');
      return;
    }
    if (!file) {
      alert('Please upload the teams.');
      return;
    }
    dispatch(SessionActions.bulkUploadTeam(selectedAssessment, file, students));
    navigate(`/courses/${courseId}/teamformation`);
  };

  return (
    <div className={classes['form-container']}>
      <Form>
        <h2>Import Team</h2>
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
              <label className={classes['form-label']}>Max No. Student:</label>
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

        <FileUploader multiple={false} handleChange={handleChange} name="file" types={fileTypes} />
        <p>{file ? `File name: ${file.name}` : 'No file uploaded'}</p>

        <div className={classes['form-footer']}>
          <Button intent="danger" onClick={backToTeamDashboard}>
            Back
          </Button>

          <div>
            <Button intent="success" onClick={submitForm}>
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
export const Component = TeamFormationImport;
Component.displayName = 'TeamFormationImport';

export default TeamFormationImport;
