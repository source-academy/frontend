import { Button, ButtonGroup, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';

import { Assessment, mcqTemplate, programmingTemplate } from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';
import Markdown from '../Markdown';
import { history } from '../utils/HistoryHelper';

type ManageQuestionTabProps = DispatchProps & StateProps;

type DispatchProps = {
  updateAssessment: (assessment: Assessment) => void;
};

type StateProps = {
  assessment: Assessment;
  hasUnsavedChanges: boolean;
  questionId: number;
};

export const ManageQuestionTab: React.FC<ManageQuestionTabProps> = props => {
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);
  const [modifyAssessment, setModifyAssessment] = useState<VoidFunction>(() => {});

  const manageQuestionTab = (index: number) => {
    return (
      <div>
        {controlButton(
          `Clone`,
          IconNames.DOCUMENT,
          confirmSave(makeQuestion(() => deepCopy(props.assessment.questions[index]), index))
        )}
        {controlButton(`Delete`, IconNames.REMOVE, confirmSave(deleteQuestion(index)))}
        {controlButton(
          `Shift Up`,
          IconNames.CARET_UP,
          confirmSave(shiftQuestion(-1, index)),
          {},
          index === 0
        )}
        {controlButton(
          `Shift Down`,
          IconNames.CARET_DOWN,
          confirmSave(shiftQuestion(1, index)),
          {},
          index >= props.assessment.questions.length - 1
        )}
        <br />
        {controlButton(
          'Insert Programming Question',
          IconNames.FONT,
          confirmSave(makeQuestion(programmingTemplate, index))
        )}
        {controlButton(
          'Insert MCQ Question',
          IconNames.CONFIRM,
          confirmSave(makeQuestion(mcqTemplate, index))
        )}
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
      history.push('/mission-control/-1/' + newIndex.toString());
    }
  };

  const makeQuestion = (template: () => any, index: number) => () => {
    const assessment = props.assessment;
    index = index + 1;
    const questions = assessment.questions;
    questions.splice(index, 0, template());
    assessment.questions = questions;
    props.updateAssessment(assessment);
    history.push('/mission-control/-1/' + index.toString());
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
  const confirmSaveOverlay = () => (
    <Dialog
      className="assessment-reset"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={showSaveOverlay}
      title="Confirmation: Save unsaved changes?"
    >
      <div className={Classes.DIALOG_BODY}>
        <Markdown content="Are you sure you want to save over your unsaved changes?" />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <ButtonGroup>
          {controlButton('Cancel', null, () => setShowSaveOverlay(false), {
            minimal: false
          })}
          {controlButton(
            'Confirm',
            null,
            () => {
              modifyAssessment();
              setShowSaveOverlay(false);
            },
            { minimal: false, intent: Intent.DANGER }
          )}
        </ButtonGroup>
      </div>
    </Dialog>
  );

  return (
    <div>
      {confirmSaveOverlay()}
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
