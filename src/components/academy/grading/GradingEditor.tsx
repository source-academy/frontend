import { H3, HTMLTable, Intent, NumericInput, Position, Pre, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Prompt } from 'react-router';

import { showWarningMessage } from '../../../utils/notification';
import { stringParamToInt } from '../../../utils/paramParseHelpers';
import { controlButton } from '../../commons';

type GradingEditorProps = DispatchProps & OwnProps;

export type DispatchProps = {
  handleGradingSave: (
    submissionId: number,
    questionId: number,
    gradeAdjustment: number | undefined,
    xpAdjustment: number | undefined
  ) => void;
};

export type OwnProps = {
  solution: number | string | null;
  questionId: number;
  submissionId: number;
  initialGrade: number;
  gradeAdjustment: number;
  maxGrade: number;
  initialXp: number;
  xpAdjustment: number;
  maxXp: number;
  studentName: string;
};

/**
 * Keeps track of the current editor state,
 * as well as the grade adjustment in the numeric input.
 *
 * @prop gradeAdjustmentInput a potentially null string which defines the
 *   result for the number grade input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 * @prop xpAdjustmentInput a potentially null string which defines the
 *   result for the number grade input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 */
type State = {
  gradeAdjustmentInput: string | null;
  xpAdjustmentInput: string | null;
};

class GradingEditor extends React.Component<GradingEditorProps, State> {
  constructor(props: GradingEditorProps) {
    super(props);
    this.state = {
      gradeAdjustmentInput: props.gradeAdjustment.toString(),
      xpAdjustmentInput: props.xpAdjustment.toString()
    };
  }

  public render() {
    const hasUnsavedChanges = this.hasUnsavedChanges();
    const saveButtonOpts = {
      intent: hasUnsavedChanges ? Intent.WARNING : Intent.NONE,
      minimal: !hasUnsavedChanges,
      fullWidth: true,
      className: 'grading-editor-save-button'
    };
    return (
      <div className="GradingEditor">
        {hasUnsavedChanges ? (
          <Prompt
            message={'You have changes that may not be saved. Are you sure you want to leave?'}
          />
        ) : null}

        <div className="grading-editor-student-name">
          <H3>Currently Grading: {this.props.studentName}</H3>
        </div>
        {this.props.solution !== null ? (
          <div className="grading-editor-solution">
            <Pre> {this.props.solution.toString()} </Pre>
          </div>
        ) : null}
        <div className="grading-editor-input-parent">
          <HTMLTable>
            <tbody>
              <tr>
                <th> {`Auto-grader's grade:`} </th>
                <td>
                  <Text>
                    {this.props.initialGrade} / {this.props.maxGrade}
                  </Text>
                </td>
                <th> {`Auto-grader's XP:`} </th>
                <td>
                  <Text>
                    {this.props.initialXp} / {this.props.maxXp}
                  </Text>
                </td>
              </tr>
              <tr>
                <th> {`Your adjustment:`} </th>
                <td>
                  <NumericInput
                    className="grading-adjustment-input"
                    onValueChange={this.onGradeAdjustmentInputChange}
                    value={this.state.gradeAdjustmentInput || ''}
                    buttonPosition={Position.RIGHT}
                    fill={true}
                    placeholder="Adjust grades relatively here"
                    min={0 - this.props.initialGrade}
                    max={
                      this.props.maxGrade > this.props.initialGrade
                        ? this.props.maxGrade - this.props.initialGrade
                        : undefined
                    }
                  />
                </td>
                <th> {`Your adjustment:`} </th>
                <td>
                  <NumericInput
                    className="grading-adjustment-input"
                    onValueChange={this.onXpAdjustmentInputChange}
                    value={this.state.xpAdjustmentInput || ''}
                    buttonPosition={Position.RIGHT}
                    fill={true}
                    placeholder="Adjust XP relatively here"
                    min={0 - this.props.initialXp}
                    max={
                      this.props.maxXp > this.props.initialXp
                        ? this.props.maxXp - this.props.initialXp
                        : undefined
                    }
                  />
                </td>
              </tr>
              <tr>
                <th> {`Final grade:`} </th>
                <td>
                  <Text>
                    {this.props.initialGrade +
                      (stringParamToInt(this.state.gradeAdjustmentInput || undefined) || 0)}{' '}
                    / {this.props.maxGrade}
                  </Text>
                </td>
                <th> {`Final XP:`} </th>
                <td>
                  <Text>
                    {this.props.initialXp +
                      (stringParamToInt(this.state.xpAdjustmentInput || undefined) || 0)}{' '}
                    / {this.props.maxXp}
                  </Text>
                </td>
              </tr>
            </tbody>
          </HTMLTable>
        </div>
        {controlButton('Save', IconNames.FLOPPY_DISK, this.onClickSaveButton, saveButtonOpts)}
      </div>
    );
  }

  private onClickSaveButton = () => {
    const gradeAdjustmentInput =
      stringParamToInt(this.state.gradeAdjustmentInput || undefined) || undefined;
    const grade = this.props.initialGrade + (gradeAdjustmentInput || 0);
    const xpAdjustmentInput =
      stringParamToInt(this.state.xpAdjustmentInput || undefined) || undefined;
    const xp = this.props.initialXp + (xpAdjustmentInput || 0);
    if (grade < 0 || grade > this.props.maxGrade) {
      showWarningMessage(
        `Grade ${grade.toString()} is out of bounds. Maximum grade is ${this.props.maxGrade.toString()}.`
      );
    } else if (xp < 0 || xp > this.props.maxXp) {
      showWarningMessage(
        `XP ${xp.toString()} is out of bounds. Maximum xp is ${this.props.maxXp.toString()}.`
      );
    } else {
      this.props.handleGradingSave(
        this.props.submissionId,
        this.props.questionId,
        gradeAdjustmentInput,
        xpAdjustmentInput
      );
    }
  };

  /**
   * Handles changes in the grade NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  private onGradeAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    this.setState({
      ...this.state,
      gradeAdjustmentInput: valueAsString,
      xpAdjustmentInput: String(
        Math.round((valueAsNumber / this.props.maxGrade) * this.props.maxXp) || 0
      )
    });
  };

  /**
   * Handles changes in the XP NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  private onXpAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    this.setState({
      ...this.state,
      xpAdjustmentInput: valueAsString
    });
  };

  private hasUnsavedChanges = () => {
    const gradeAdjustmentInput = stringParamToInt(this.state.gradeAdjustmentInput || undefined);
    const xpAdjustmentInput = stringParamToInt(this.state.xpAdjustmentInput || undefined);
    return (
      this.props.gradeAdjustment !== gradeAdjustmentInput ||
      this.props.xpAdjustment !== xpAdjustmentInput
    );
  };
}

export default GradingEditor;
