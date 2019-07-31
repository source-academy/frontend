import {
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
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import * as React from 'react';
import ReactMde, { ReactMdeProps } from 'react-mde';
import { Prompt } from 'react-router';

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

type GradingEditorDraft = {
  gradeAdjustment: string;
  xpAdjustment: string;
  comments?: string;
};

export type DispatchProps = {
  handleGradingSave: GradingSaveFunction;
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
 * @prop draft a cache for the local draft stored on the user's system, to allow for
 *   easy comparison between the local draft and the current grading editor values.
 *   'draft' can be undefined. But if it is defined, 'draft.gradeAdjustmentInput'
 *   and 'draft.xpAdjustmentInput' cannot be undefined.
 *
 *   To reflect no changes they are set to '0', so when the draft is loaded
 *   '0' will be seen in the input boxes
 *
 * @prop highlightLoadDraft determines whether the 'Load Draft' button
 *   has an orange colour, or should remain in the background
 *
 * @prop currentlySaving determines whether the 'You have unsaved changes'
 *   prompt should appear on page navigation, to prevent the
 *   'Submit and Continue' button from activating the prompt
 *   in cases where navigation occurs before Redux has
 *   updated the props of the Editor component
 *
 *   This may pose a problem if the user clicks 'Submit and Continue'
 *   and the 'Submit' process fails. The prompt would no longer
 *   appear although there exist unsaved changes
 */
type State = {
  gradeAdjustmentInput: string | null;
  xpAdjustmentInput: string | null;
  editorValue?: string;
  selectedTab: ReactMdeProps['selectedTab'];
  draft?: GradingEditorDraft;
  highlightLoadDraft: boolean;
  currentlySaving: boolean;
};

const gradingEditorButtonClass = 'grading-editor-button';

/**
 * Function to generate a unique string for every instance of
 * the grading editor, assuming that each grade corresponds
 * to a unique submissionId and questionId
 *
 * This function is used in the Redux Sagas, so the local draft
 * can be removed when the Grading has been submitted
 */
export const generateGradingEditorDraftKey = (submissionId: number, questionId: number): string => {
  return `gradingDraftS${submissionId}Q${questionId}`;
};

class GradingEditor extends React.Component<GradingEditorProps, State> {
  private draftId = generateGradingEditorDraftKey(this.props.submissionId, this.props.questionId);

  constructor(props: GradingEditorProps) {
    super(props);
    this.state = {
      gradeAdjustmentInput: props.gradeAdjustment.toString(),
      xpAdjustmentInput: props.xpAdjustment.toString(),
      editorValue: props.comments,
      selectedTab: 'write',
      draft: this.loadFromLocalStorage(),
      highlightLoadDraft: true,
      currentlySaving: false
    };
  }

  public render() {
    const hasNotSubmitted = this.hasNotSubmitted();
    const hasUnsavedChanges = hasNotSubmitted && this.hasUnsavedDraft();
    const saveButtonOpts = {
      intent: hasUnsavedChanges ? Intent.WARNING : Intent.NONE,
      minimal: !hasUnsavedChanges,
      className: gradingEditorButtonClass
    };
    const loadButtonOpts = {
      intent: this.state.highlightLoadDraft ? Intent.WARNING : Intent.NONE,
      minimal: !this.state.highlightLoadDraft,
      className: gradingEditorButtonClass
    };
    const submitButtonOpts = {
      intent: hasNotSubmitted ? Intent.SUCCESS : Intent.NONE,
      minimal: !hasNotSubmitted,
      fullWidth: true,
      className: classNames(gradingEditorButtonClass, 'grading-editor-submit')
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
                <td>
                  {controlButton(
                    'Save Draft',
                    IconNames.FLOPPY_DISK,
                    this.validateGradesBeforeSave(this.saveToLocalStorage),
                    saveButtonOpts
                  )}
                </td>
                {this.state.draft && (
                  <td>
                    {controlButton(
                      'Load Draft',
                      IconNames.DOCUMENT_OPEN,
                      hasUnsavedChanges ? this.loadWarning : this.loadDraft,
                      loadButtonOpts
                    )}
                  </td>
                )}
              </tbody>
            </HTMLTable>
          </div>
        )}
        {controlButton(
          'Submit and Continue',
          IconNames.UPDATED,
          this.validateGradesBeforeSave(this.onClickSubmitAndContinue),
          submitButtonOpts
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
  private validateGradesBeforeSave = (
    handleSaving: GradingSaveFunction
  ): (() => void) | undefined => {
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
      return () =>
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
  private onClickSubmitAndContinue: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    gradeAdjustment: number | undefined,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const callback = (): void => {
      this.props.handleGradingSave(
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
   * Function to save grading data to local storage, as
   * well as cache it in the 'draft' component state
   */
  private saveToLocalStorage: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    gradeAdjustment: number | undefined,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const numToString = (adjustment: number | undefined) =>
      adjustment === undefined ? '0' : adjustment.toString();
    const draft: GradingEditorDraft = {
      gradeAdjustment: numToString(gradeAdjustment),
      xpAdjustment: numToString(xpAdjustment),
      comments: comments || ''
    };
    try {
      localStorage.setItem(this.draftId, compressToUTF16(JSON.stringify(draft)));
      this.setState({ ...this.state, draft, highlightLoadDraft: false });
      showSuccessMessage('Saved local copy of draft!', 1000);
    } catch (err) {
      showWarningMessage('Error: Saving draft to local storage failed');
    }
  };

  /**
   * Send a warning prompt that loading from a local draft
   * will overwrite any unsaved changes
   */
  private loadWarning = (): void => {
    if (confirm('Loading from a local draft will overwrite your unsaved changes. Are you sure?')) {
      this.loadDraft();
    }
  };

  /**
   * Set the text in the editor to the current saved comments
   * in the 'draft' state
   */
  private loadDraft = (): void => {
    this.setState(
      state => {
        if (state.draft) {
          return {
            ...state,
            gradeAdjustmentInput: state.draft.gradeAdjustment,
            xpAdjustmentInput: state.draft.xpAdjustment,
            editorValue: state.draft.comments,
            highlightLoadDraft: false
          };
        } else {
          return state;
        }
      },
      () => {
        showSuccessMessage('Loaded!', 1000);
      }
    );
  };

  /**
   * Function to retrieve grading data from local storage
   *
   * Should only need to be called once when the component is
   * rendered, to set the value of the 'draft' state, as
   * further draft saves will be stored in the current
   * state of the component
   */
  private loadFromLocalStorage = (): GradingEditorDraft | undefined => {
    try {
      const serialized = localStorage.getItem(this.draftId);
      if (!serialized) {
        return undefined;
      }
      const draft = JSON.parse(decompressFromUTF16(serialized)) as GradingEditorDraft;
      showSuccessMessage(
        "Local draft of grading found! Select 'Load Draft' to load it into the editor",
        2500
      );
      return draft;
    } catch (err) {
      showWarningMessage('Error: Loading draft from local storage failed');
      return undefined;
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

  private hasNotSubmitted = () => {
    const gradeAdjustmentInput = stringParamToInt(this.state.gradeAdjustmentInput || undefined);
    const xpAdjustmentInput = stringParamToInt(this.state.xpAdjustmentInput || undefined);
    return (
      this.props.gradeAdjustment !== gradeAdjustmentInput ||
      this.props.xpAdjustment !== xpAdjustmentInput ||
      this.props.comments !== this.state.editorValue
    );
  };

  private hasUnsavedDraft = () => {
    return this.state.draft
      ? this.state.draft.gradeAdjustment !== this.state.gradeAdjustmentInput ||
          this.state.draft.xpAdjustment !== this.state.xpAdjustmentInput ||
          this.state.draft.comments !== this.state.editorValue
      : this.state.gradeAdjustmentInput || this.state.xpAdjustmentInput || this.state.editorValue;
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
