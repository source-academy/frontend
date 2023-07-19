import '@tremor/react/dist/esm/tremor.css';
import 'src/styles/_teamformation.scss';

import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Form } from 'react-router-dom';
import Select from 'react-select';
import { bulkUploadTeam } from 'src/commons/application/actions/SessionActions';
import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';

const TeamFormationImport: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileTypes = ['XLSX', 'XLS'];
  const [file, setFile] = useState<File | null>(null); // Specify the type of 'file'
  const { courseId } = useTypedSelector(state => state.session);
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
    dispatch(bulkUploadTeam(selectedAssessment, file));
    navigate(`/courses/${courseId}/teamformation`);
  };

  return (
    <div className="form-container">
      <Form>
        <h2>Import Team</h2>
        <div className="form-field-row">
          <div className="form-field">
            <label htmlFor="assessment" className="form-label">
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
              className="form-select"
            />
          </div>
          {selectedAssessment && (
            <div className="form-field">
              <label className="form-label">Max No. Student:</label>
              <input
                type="text"
                className="form-select"
                value={maxNoOfStudents}
                readOnly
                disabled // Make the input read-only and disabled
              />
            </div>
          )}
        </div>

        <FileUploader multiple={false} handleChange={handleChange} name="file" types={fileTypes} />
        <p>{file ? `File name: ${file.name}` : 'No file uploaded'}</p>

        <div className="form-footer">
          <button type="button" onClick={backToTeamDashboard} className="back-button">
            Back
          </button>

          <div className="submit-button-container">
            <button type="button" onClick={submitForm} className="submit-button">
              Submit
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default TeamFormationImport;
