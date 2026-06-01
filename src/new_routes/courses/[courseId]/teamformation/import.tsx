import { Button } from '@blueprintjs/core';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import SessionActions from 'src/commons/application/actions/SessionActions';
import type { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { FormContainer, FormField, FormFieldRow } from 'src/components/ui/form';

function TeamFormationImport() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileTypes = ['XLSX', 'XLS'];
  const [file, setFile] = useState<File | null>(null);
  const { courseId, students } = useTypedSelector(state => state.session);
  const assessmentOverviews = useTypedSelector(state => state.session.assessmentOverviews);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentOverview | undefined>(
    undefined,
  );
  let maxNoOfStudents: number | undefined = selectedAssessment ? selectedAssessment.maxTeamSize : 0;

  const handleChange = (uploaded: File | File[]) => {
    const selectedFile = Array.isArray(uploaded) ? (uploaded[0] ?? null) : uploaded;
    setFile(selectedFile);
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
    <FormContainer heading="Import Team">
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
          <FormField label="Max No. Student:">
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

      <FileUploader multiple={false} handleChange={handleChange} name="file" types={fileTypes} />
      <p>{file ? `File name: ${file.name}` : 'No file uploaded'}</p>

      <div className="mt-5 mb-2.5 flex justify-between items-center">
        <Button intent="danger" onClick={backToTeamDashboard}>
          Back
        </Button>

        <div>
          <Button intent="success" onClick={submitForm}>
            Submit
          </Button>
        </div>
      </div>
    </FormContainer>
  );
}

export const Component = TeamFormationImport;
