import { Button, Dialog, DialogBody, DialogFooter, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import { Assessment, mcqTemplate, programmingTemplate } from '../assessment/AssessmentTypes';
import ControlButton from '../ControlButton';
import Markdown from '../Markdown';

type ManageQuestionTabProps = DispatchProps & StateProps;

type DispatchProps = {
  updateAssessment: (assessment: Assessment) => void;
};

type StateProps = {
  assessment: Assessment;
  hasUnsavedChanges: boolean;
  questionId: number;
};

const ManageQuestionTab: React.FC<ManageQuestionTabProps> = props => {
  const navigate = useNavigate();
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);
  const [modifyAssessment, setModifyAssessment] = useState<VoidFunction>(() => {});

  const manageQuestionTab = (index: number) => {
    return (
      <div>
        <ControlButton
          label="Clone"
          icon={IconNames.DOCUMENT}
          onClick={confirmSave(
            makeQuestion(() => deepCopy(props.assessment.questions[index]), index)
          )}
        />
        <ControlButton
          label="Delete"
          icon={IconNames.REMOVE}
          onClick={confirmSave(deleteQuestion(index))}
        />
        <ControlButton
          label="Shift Up"
          icon={IconNames.CARET_UP}
          onClick={confirmSave(shiftQuestion(-1, index))}
          isDisabled={index === 0}
        />
        <ControlButton
          label="Shift Down"
          icon={IconNames.CARET_DOWN}
          onClick={confirmSave(shiftQuestion(1, index))}
          isDisabled={index >= props.assessment.questions.length - 1}
        />
        <br />
        <ControlButton
          label="Insert Programming Question"
          icon={IconNames.FONT}
          onClick={confirmSave(makeQuestion(programmingTemplate, index))}
        />
        <ControlButton
          label="Insert MCQ Question"
          icon={IconNames.CONFIRM}
          onClick={confirmSave(makeQuestion(mcqTemplate, index))}
        />
      </div>
    );
  };

  const shiftQuestion = (dir: number, index: number) => () => {
    const assessment = props.assessment;
    const newIndex = index + dir;
    if (newIndex >= 0 && newIndex < assessment.questions.length) {
      const question = assessment.questions[index];
      const questions = assessment.questions;
      questions[index] = questions[newIndex];
      questions[newIndex] = question;
      assessment.questions = questions;
      props.updateAssessment(assessment);
      navigate('/mission-control/-1/' + newIndex.toString());
    }
  };

  const makeQuestion = (template: () => any, index: number) => () => {
    const assessment = props.assessment;
    index = index + 1;
    const questions = assessment.questions;
    questions.splice(index, 0, template());
    assessment.questions = questions;
    props.updateAssessment(assessment);
    navigate('/mission-control/-1/' + index.toString());
  };

  const deleteQuestion = (index: number) => () => {
    const assessment = props.assessment;
    let questions = assessment.questions;
    if (questions.length > 1) {
      questions = questions.slice(0, index).concat(questions.slice(index + 1));
    }
    assessment.questions = questions;
    props.updateAssessment(assessment);
  };

  const confirmSave = (modifyAssessment: () => void) => () => {
    if (props.hasUnsavedChanges) {
      setShowSaveOverlay(true);
      setModifyAssessment(modifyAssessment);
    } else {
      modifyAssessment();
    }
  };

  /**
   * Asks to save work.
   */
  const confirmSaveOverlay = (
    <Dialog
      className="assessment-reset"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={showSaveOverlay}
      title="Confirmation: Save unsaved changes?"
    >
      <DialogBody>
        <Markdown content="Are you sure you want to save over your unsaved changes?" />
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <ControlButton
              label="Cancel"
              onClick={() => setShowSaveOverlay(false)}
              options={{ minimal: false }}
            />
            <ControlButton
              label="Confirm"
              onClick={() => {
                modifyAssessment();
                setShowSaveOverlay(false);
              }}
              options={{ minimal: false, intent: Intent.DANGER }}
            />
          </>
        }
      />
    </Dialog>
  );

  return (
    <div>
      {confirmSaveOverlay}
      {props.assessment.questions.map((q, index) => (
        <div key={index}>
          Question {index + 1}
          <br />
          <Button className="mcq-option col-xs-12" minimal={true}>
            <Markdown
              content={q.content.length > 200 ? q.content.substring(0, 300) + '...' : q.content}
            />
          </Button>
          {manageQuestionTab(index)}
          <br />
          <br />
        </div>
      ))}
    </div>
  );
};

const deepCopy = (arr: any) => {
  return JSON.parse(JSON.stringify(arr));
};

export default ManageQuestionTab;
