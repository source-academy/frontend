import { Button, ButtonGroup, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { history } from '../../utils/history';
import { Assessment, mcqTemplate, programmingTemplate } from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';
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

type State = {
  showSaveOverlay: boolean;
  modifyAssessment: () => void;
};

export class ManageQuestionTab extends React.Component<ManageQuestionTabProps, State> {
  public constructor(props: ManageQuestionTabProps) {
    super(props);
    this.state = {
      showSaveOverlay: false,
      modifyAssessment: () => {}
    };
  }

  public render() {
    return (
      <div>
        {this.confirmSaveOverlay()}
        {this.props.assessment.questions.map((q, index) => (
          <div key={index}>
            Question {index + 1}
            <br />
            <Button className="mcq-option col-xs-12" minimal={true}>
              <Markdown
                content={q.content.length > 200 ? q.content.substring(0, 300) + '...' : q.content}
              />
            </Button>
            {this.manageQuestionTab(index)}
            <br />
            <br />
          </div>
        ))}
      </div>
    );
  }

  private manageQuestionTab = (index: number) => {
    return (
      <div>
        {controlButton(
          `Clone`,
          IconNames.DOCUMENT,
          this.confirmSave(
            this.makeQuestion(() => deepCopy(this.props.assessment.questions[index]), index)
          )
        )}
        {controlButton(`Delete`, IconNames.REMOVE, this.confirmSave(this.deleteQuestion(index)))}
        {controlButton(
          `Shift Up`,
          IconNames.CARET_UP,
          this.confirmSave(this.shiftQuestion(-1, index)),
          {},
          index === 0
        )}
        {controlButton(
          `Shift Down`,
          IconNames.CARET_DOWN,
          this.confirmSave(this.shiftQuestion(1, index)),
          {},
          index >= this.props.assessment.questions.length - 1
        )}
        <br />
        {controlButton(
          'Insert Programming Question',
          IconNames.FONT,
          this.confirmSave(this.makeQuestion(programmingTemplate, index))
        )}
        {controlButton(
          'Insert MCQ Question',
          IconNames.CONFIRM,
          this.confirmSave(this.makeQuestion(mcqTemplate, index))
        )}
      </div>
    );
  };

  private shiftQuestion = (dir: number, index: number) => () => {
    const assessment = this.props.assessment;
    const newIndex = index + dir;
    if (newIndex >= 0 && newIndex < assessment.questions.length) {
      const question = assessment.questions[index];
      const questions = assessment.questions;
      questions[index] = questions[newIndex];
      questions[newIndex] = question;
      assessment.questions = questions;
      this.props.updateAssessment(assessment);
      history.push('/mission-control/-1/' + newIndex.toString());
    }
  };

  private makeQuestion = (template: () => any, index: number) => () => {
    const assessment = this.props.assessment;
    index = index + 1;
    const questions = assessment.questions;
    questions.splice(index, 0, template());
    assessment.questions = questions;
    this.props.updateAssessment(assessment);
    history.push('/mission-control/-1/' + index.toString());
  };

  private deleteQuestion = (index: number) => () => {
    const assessment = this.props.assessment;
    let questions = assessment.questions;
    if (questions.length > 1) {
      questions = questions.slice(0, index).concat(questions.slice(index + 1));
    }
    assessment.questions = questions;
    this.props.updateAssessment(assessment);
  };

  private confirmSave = (modifyAssessment: () => void) => () => {
    if (this.props.hasUnsavedChanges) {
      this.setState({
        showSaveOverlay: true,
        modifyAssessment
      });
    } else {
      modifyAssessment();
    }
  };

  /**
   * Asks to save work.
   */
  private confirmSaveOverlay = () => (
    <Dialog
      className="assessment-reset"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={this.state.showSaveOverlay}
      title="Confirmation: Save unsaved changes?"
    >
      <div className={Classes.DIALOG_BODY}>
        <Markdown content="Are you sure you want to save over your unsaved changes?" />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <ButtonGroup>
          {controlButton('Cancel', null, () => this.setState({ showSaveOverlay: false }), {
            minimal: false
          })}
          {controlButton(
            'Confirm',
            null,
            () => {
              this.state.modifyAssessment();
              this.setState({
                showSaveOverlay: false
              });
            },
            { minimal: false, intent: Intent.DANGER }
          )}
        </ButtonGroup>
      </div>
    </Dialog>
  );
}

const deepCopy = (arr: any) => {
  return JSON.parse(JSON.stringify(arr));
};

export default ManageQuestionTab;
