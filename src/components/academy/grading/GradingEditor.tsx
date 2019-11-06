import {
  Divider,
  H3,
  HTMLTable,
  Icon,
  IconName,
  Intent,
  NumericInput,
  Position,
  Pre,
  Text
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import ReactMde, { ReactMdeProps } from 'react-mde';
import { Prompt } from 'react-router';

import { getPrettyDate } from '../../../utils/dateHelpers';
import { showSuccessMessage, showWarningMessage } from '../../../utils/notification';
import { stringParamToInt } from '../../../utils/paramParseHelpers';
import { controlButton } from '../../commons';
import Markdown from '../../commons/Markdown';

type GradingEditorProps = DispatchProps & OwnProps;

type GradingSaveFunction = (
  submissionId: number,
  questionId: number,
  gradeAdjustment: number | undefined,
  xpAdjustment: number | undefined,
  comments?: string
) => void;

export type DispatchProps = {
  handleGradingSave: GradingSaveFunction;
  handleGradingSaveAndContinue: GradingSaveFunction;
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
  comments?: string;
  graderName?: string;
  gradedAt?: string;
};

/**
 * Keeps track of the current editor state,
 * as well as the grade adjustment in the numeric input.
 *
 * @prop gradeAdjustmentInput a potentially null string which defines the
 *   result for the number grade input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 *
 * @prop xpAdjustmentInput a potentially null string which defines the
 *   result for the number XP input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 *
 * @prop editorValue the text in the react-mde editor, that will be saved
 *   to a comment displayed below the numerical grade and XP
 *
 * @prop selectedTab the selected tab for the react-mde editor
 *   (either 'write' or 'preview')
 *
 * @prop currentlySaving determines whether the 'You have unsaved changes'
 *   prompt should appear on page navigation, to prevent the
 *   'Save and Continue' button from activating the prompt
 *   in cases where navigation occurs before Redux has
 *   updated the props of the Editor component
 *
 *   This may pose a problem if the user clicks 'Save and Continue'
 *   and the saving process fails. The prompt would no longer
 *   appear although there exist unsaved changes
 */
type State = {
  gradeAdjustmentInput: string | null;
  xpAdjustmentInput: string | null;
  editorValue?: string;
  selectedTab: ReactMdeProps['selectedTab'];
  currentlySaving: boolean;
};

const gradingEditorButtonClass = 'grading-editor-button';

class GradingEditor extends React.Component<GradingEditorProps, State> {
  constructor(props: GradingEditorProps) {
    super(props);
    this.state = {
      gradeAdjustmentInput: props.gradeAdjustment.toString(),
      xpAdjustmentInput: props.xpAdjustment.toString(),
      editorValue: props.comments,
      selectedTab: 'write',
      currentlySaving: false
    };
  }

  public render() {
    const hasUnsavedChanges = this.hasUnsavedChanges();
    const saveButtonOpts = {
      intent: hasUnsavedChanges ? Intent.WARNING : Intent.NONE,
      minimal: !hasUnsavedChanges,
      className: gradingEditorButtonClass
    };
    const discardButtonOpts = {
      intent: hasUnsavedChanges ? Intent.DANGER : Intent.NONE,
      minimal: !hasUnsavedChanges,
      className: gradingEditorButtonClass
    };
    const saveAndContinueButtonOpts = {
      intent: hasUnsavedChanges ? Intent.SUCCESS : Intent.NONE,
      minimal: !hasUnsavedChanges,
      className: classNames(gradingEditorButtonClass, 'grading-editor-save-and-continue')
    };
    const onTabChange = (tab: ReactMdeProps['selectedTab']) =>
      this.setState({
        ...this.state,
        selectedTab: tab
      });

    return (
      <div className="GradingEditor">
        {!this.state.currentlySaving && hasUnsavedChanges ? (
          <Prompt message={'You have unsaved changes. Are you sure you want to leave?'} />
        ) : null}

        <div className="grading-editor-student-name">
          <H3>Currently Grading: {this.props.studentName}</H3>
        </div>
        {this.props.solution !== null ? (
          <div className="grading-editor-solution">
            <Pre>{this.props.solution.toString()} </Pre>
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
        <div className="react-mde-parent">
          <ReactMde
            value={this.state.editorValue || ''}
            onChange={this.handleEditorValueChange}
            selectedTab={this.state.selectedTab}
            onTabChange={onTabChange}
            generateMarkdownPreview={this.generateMarkdownPreview}
            minEditorHeight={200}
            maxEditorHeight={1000}
            minPreviewHeight={240}
            getIcon={this.blueprintIconProvider}
          />
        </div>
        {this.state.selectedTab === 'write' && (
          <div className="grading-editor-draft-buttons">
            <HTMLTable>
              <tbody>
                <tr>
                  <td>
                    {controlButton(
                      'Save Changes',
                      IconNames.FLOPPY_DISK,
                      this.validateGradesBeforeSave(this.props.handleGradingSave),
                      saveButtonOpts
                    )}
                  </td>
                  <td>
                    {controlButton(
                      'Discard Changes',
                      IconNames.TRASH,
                      this.discardChanges,
                      discardButtonOpts
                    )}
                  </td>
                </tr>
              </tbody>
            </HTMLTable>
          </div>
        )}
        {controlButton(
          'Save and Continue',
          IconNames.UPDATED,
          this.validateGradesBeforeSave(this.onClickSaveAndContinue),
          saveAndContinueButtonOpts
        )}
        {this.props.graderName && this.props.gradedAt && (
          <>
            <Divider />
            <div>
              <Text>
                Last edited by <b>{this.props.graderName}</b> on{' '}
                {getPrettyDate(this.props.gradedAt)}
              </Text>
            </div>
          </>
        )}
      </div>
    );
  }

  /**
   * A custom icons provider. It uses a bulky mapping function
   * defined below.
   *
   * See {@link https://github.com/andrerpena/react-mde}
   */
  private blueprintIconProvider(name: string) {
    const blueprintIcon = mdeToBlueprintIconMapping(name);
    return <Icon icon={blueprintIcon.iconName} htmlTitle={blueprintIcon.title} />;
  }

  /**
   * Makes sure that the Grade and XP values are permissible before
   * returning the relevant saving function (for the 'Save Draft'
   * and 'Submit and Continue' buttons)
   */
  private validateGradesBeforeSave = (handleSaving: GradingSaveFunction): (() => void) => () => {
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
      return;
    } else if (xp < 0 || xp > this.props.maxXp) {
      showWarningMessage(
        `XP ${xp.toString()} is out of bounds. Maximum xp is ${this.props.maxXp.toString()}.`
      );
      return;
    } else {
      handleSaving(
        this.props.submissionId,
        this.props.questionId,
        gradeAdjustmentInput,
        xpAdjustmentInput,
        this.state.editorValue!
      );
    }
  };

  /**
   * Sets the state currentlySaving to true to disable
   * the 'You have unsaved changes' prompt
   */
  private onClickSaveAndContinue: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    gradeAdjustment: number | undefined,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const callback = (): void => {
      this.props.handleGradingSaveAndContinue(
        submissionId,
        questionId,
        gradeAdjustment,
        xpAdjustment,
        comments!
      );
    };
    this.setState({ ...this.state, currentlySaving: true }, callback);
  };

  /**
   * Send a warning prompt that loading from a local draft
   * will overwrite any unsaved changes
   */
  private discardChanges = (): void => {
    if (!this.hasUnsavedChanges() || confirm('This will reset the editor. Are you sure?')) {
      this.setState(
        {
          ...this.state,
          gradeAdjustmentInput: this.props.gradeAdjustment!.toString(),
          xpAdjustmentInput: this.props.xpAdjustment!.toString(),
          editorValue: this.props.comments || ''
        },
        () => {
          showSuccessMessage('Discarded!', 1000);
        }
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

  private handleEditorValueChange = (editorValue: string) => {
    this.setState({
      ...this.state,
      editorValue
    });
  };

  private hasUnsavedChanges = () => {
    const gradeAdjustmentInput = stringParamToInt(this.state.gradeAdjustmentInput || undefined);
    const xpAdjustmentInput = stringParamToInt(this.state.xpAdjustmentInput || undefined);
    return (
      this.props.gradeAdjustment !== gradeAdjustmentInput ||
      this.props.xpAdjustment !== xpAdjustmentInput ||
      this.props.comments !== this.state.editorValue
    );
  };

  private generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(
      <Markdown
        content={markdown}
        simplifiedAutoLink={true}
        strikethrough={true}
        tasklists={true}
        openLinksInNewWindow={true}
      />
    );
}

/**
 * Maps react-mde icon names to blueprintjs counterparts
 * to reduce the number of dependencies on icons and
 * keep a more consistent look
 *
 * Also, generate a HTML title for the icon to be shown on mouse hover
 *
 * By default, react-mde would use FontAwesome5 icons if this
 * icon mapping is not provided
 */
const mdeToBlueprintIconMapping = (name: string): { iconName: IconName; title?: string } => {
  switch (name) {
    case 'header':
      return {
        iconName: IconNames.HEADER,
        title: 'Header Styles'
      };
    case 'bold':
      return {
        iconName: IconNames.BOLD,
        title: 'Bold'
      };
    case 'italic':
      return {
        iconName: IconNames.ITALIC,
        title: 'Italic'
      };
    case 'strikethrough':
      return {
        iconName: IconNames.STRIKETHROUGH,
        title: 'Strikethrough'
      };
    case 'link':
      return {
        iconName: IconNames.LINK,
        title: 'Link'
      };
    case 'quote':
      return {
        iconName: IconNames.CITATION,
        title: 'Quote'
      };
    case 'code':
      return {
        iconName: IconNames.CODE,
        title: 'Monospaced'
      };
    case 'image':
      return {
        iconName: IconNames.MEDIA,
        title: 'Image'
      };
    case 'unordered-list':
      return {
        iconName: IconNames.UNGROUP_OBJECTS,
        title: 'Bullets'
      };
    case 'ordered-list':
      return {
        iconName: IconNames.NUMBERED_LIST,
        title: 'Numbering'
      };
    case 'checked-list':
      return {
        iconName: IconNames.SQUARE,
        title: 'Checkboxes'
      };
    default:
      // For unknown icons, a question mark icon is returned
      return {
        iconName: IconNames.HELP
      };
  }
};

export default GradingEditor;
