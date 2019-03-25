import { ButtonGroup, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { history } from '../../../utils/history';
import { IAssessment } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import Markdown from '../../commons/Markdown';
import { mcqTemplate, programmingTemplate } from '../../incubator/assessmentTemplates';

interface IProps {
  assessment: IAssessment;
  hasUnsavedChanges: boolean;
  questionId: number;
  updateAssessment: (assessment: IAssessment) => void;
}

interface IState {
  showSaveOverlay: boolean;
  modifyAssessment: () => void;
}

export class ManageQuestionTab extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
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
        {this.manageQuestionTab()}
      </div>
    );
  }

  private manageQuestionTab = () => {
    const index = this.props.questionId;
    return (
      <div>
        {controlButton(
          'Clone Current Question',
          IconNames.DOCUMENT,
          this.confirmSave(
            this.makeQuestion(() =>
              deepCopy(this.props.assessment.questions[this.props.questionId])
            )
          )
        )}
        <br />
        {controlButton(
          'Insert Programming Question',
          IconNames.FONT,
          this.confirmSave(this.makeQuestion(programmingTemplate))
        )}
        {controlButton(
          'Insert MCQ Question',
          IconNames.CONFIRM,
          this.confirmSave(this.makeQuestion(mcqTemplate))
        )}
        <br />
        {controlButton(
          'Delete Current Question',
          IconNames.REMOVE,
          this.confirmSave(this.deleteQuestion)
        )}
        <br />
        {index > 0
          ? controlButton(
              'Shift Question Left',
              IconNames.CARET_LEFT,
              this.confirmSave(this.shiftQuestion(-1))
            )
          : undefined}
        {index < this.props.assessment.questions.length - 1
          ? controlButton(
              'Shift Question Right',
              IconNames.CARET_RIGHT,
              this.confirmSave(this.shiftQuestion(1))
            )
          : undefined}
      </div>
    );
  };

  private shiftQuestion = (dir: number) => () => {
    const assessment = this.props.assessment;
    const index = this.props.questionId;
    const newIndex = index + dir;
    if (newIndex >= 0 && newIndex < assessment.questions.length) {
      const question = assessment.questions[index];
      const questions = assessment.questions;
      questions[index] = questions[newIndex];
      questions[newIndex] = question;
      assessment.questions = questions;
      this.props.updateAssessment(assessment);
      history.push('/incubator/-1/' + newIndex.toString());
    }
  };

  private makeQuestion = (template: () => any) => () => {
    const assessment = this.props.assessment;
    const index = this.props.questionId + 1;
    const questions = assessment.questions;
    questions.splice(index, 0, template());
    assessment.questions = questions;
    this.props.updateAssessment(assessment);
    history.push('/incubator/-1/' + index.toString());
  };

  private deleteQuestion = () => {
    const assessment = this.props.assessment;
    let questions = assessment.questions;
    const index = this.props.questionId;
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
      isCloseButtonShown={false}
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
