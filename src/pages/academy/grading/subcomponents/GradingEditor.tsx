import {
  Button,
  Dialog,
  Divider,
  H3,
  Icon,
  IconName,
  Intent,
  NumericInput,
  Position,
  Pre
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMde, { ReactMdeProps } from 'react-mde';
import { AutogradingResult, LLMPrompt } from 'src/commons/assessment/AssessmentTypes';
import { useTokens, useTypedDispatch, useTypedSelector } from 'src/commons/utils/Hooks';

import SessionActions from '../../../../commons/application/actions/SessionActions';
import ControlButton from '../../../../commons/ControlButton';
import Markdown from '../../../../commons/Markdown';
import { Prompt } from '../../../../commons/ReactRouterPrompt';
import { postGenerateComments, saveChosenComments } from '../../../../commons/sagas/RequestsSaga';
import { getPrettyDate } from '../../../../commons/utils/DateHelper';
import { showSimpleConfirmDialog } from '../../../../commons/utils/DialogHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../../../commons/utils/notifications/NotificationsHelper';
import { convertParamToInt } from '../../../../commons/utils/ParamParseHelper';
import GradingCommentSelector from './GradingCommentSelector';
import LLMFeedbackButton from './LLMFeedbackButton';

type GradingSaveFunction = (
  submissionId: number,
  questionId: number,
  xpAdjustment: number | undefined,
  comments?: string
) => void;

type Props = {
  prompts: LLMPrompt[];
  answer_id: number;
  solution: number | string | null;
  assessmentId: number;
  questionId: number;
  submissionId: number;
  initialXp: number;
  xpAdjustment: number;
  maxXp: number;
  studentNames: string[];
  studentUsernames: string[];
  is_llm: boolean;
  comments: string;
  autoGradingStatus: string;
  autoGradingResults: AutogradingResult[];
  studentAnswer: string | null;
  graderName?: string;
  gradedAt?: string;
  ai_comments?: {
    comments: string[];
    selectedIndices: number[];
    selectedEdits: Record<number, string>;
  };
};

const gradingEditorButtonClass = 'grading-editor-button';
const EMPTY_SELECTION_SAVE_KEY = JSON.stringify({ selected_indices: [], edits: {} });

type SelectedComment = {
  originalIndex: number;
  text: string;
  isEdited: boolean;
};

type PersistedAiSelectionState = {
  selectionKey: string;
  selectedComments: SelectedComment[];
  suggestions: string[];
};

const normalizeCommentText = (text: string): string => text.replace(/^\n+/, '');

const hydrateSelectedComments = (
  sourceSuggestions: string[],
  persistedSelectedIndices: number[],
  persistedSelectedEdits: Record<number, string>
): SelectedComment[] => {
  const validSelectedIndices = [...new Set(persistedSelectedIndices)]
    .filter(index => index >= 0 && index < sourceSuggestions.length)
    .sort((a, b) => a - b);

  return validSelectedIndices.map(index => {
    const original = sourceSuggestions[index] ?? '';
    const text = normalizeCommentText(persistedSelectedEdits[index] ?? original);
    return {
      originalIndex: index,
      text,
      isEdited: text !== original
    };
  });
};

const GradingEditor: React.FC<Props> = props => {
  const dispatch = useTypedDispatch();
  const tokens = useTokens();
  const prompts = props.prompts ?? [];
  const hasPrompts = prompts.length > 0;
  const gradingSaveResult = useTypedSelector(state => state.session.gradingSaveResult);
  const currentGrading = useTypedSelector(state => state.session.gradings[props.submissionId]);
  const gradingSaveResultRef = useRef(gradingSaveResult);
  const lastSavedSelectionKeyRef = useRef<string>(EMPTY_SELECTION_SAVE_KEY);
  const initialSelectionKeyRef = useRef<string>(EMPTY_SELECTION_SAVE_KEY);
  const saveInFlightRef = useRef<boolean>(false);
  const saveAndContinueTimeoutRef = useRef<number | undefined>(undefined);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const selectedCommentsRef = useRef<SelectedComment[]>([]);
  const suggestionsRef = useRef<string[]>([]);
  const persistedAiSelectionRef = useRef<PersistedAiSelectionState>({
    selectionKey: EMPTY_SELECTION_SAVE_KEY,
    selectedComments: [],
    suggestions: []
  });
  const aiCommentTextareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const { handleGradingSave, handleGradingSaveAndContinue, handleReautogradeAnswer } = useMemo(
    () =>
      ({
        handleGradingSave: (...args) => dispatch(SessionActions.submitGrading(...args)),
        handleGradingSaveAndContinue: (...args) =>
          dispatch(SessionActions.submitGradingAndContinue(...args)),
        handleReautogradeAnswer: (...args) => dispatch(SessionActions.reautogradeAnswer(...args))
      }) satisfies {
        handleGradingSave: GradingSaveFunction;
        handleGradingSaveAndContinue: GradingSaveFunction;
        handleReautogradeAnswer: (submissionId: number, questionId: number) => void;
      },
    [dispatch]
  );

  /**
   * A potentially null string which defines the
   * result for the number XP input. This property being null
   * will show the hint text in the NumericInput. This property is a string
   * so as to allow input such as the '-' character.
   */
  const [xpAdjustmentInput, setXpAdjustmentInput] = useState<string | null>(
    props.xpAdjustment.toString()
  );
  const [userText, setUserText] = useState(props.comments);
  /**
   * The selected tab for the react-mde editor (either 'write' or 'preview')
   */
  const [selectedTab, setSelectedTab] = useState<ReactMdeProps['selectedTab']>('write');
  /**
   * Determines whether the 'You have unsaved changes'
   * prompt should appear on page navigation, to prevent the
   * 'Save and Continue' button from activating the prompt
   * in cases where navigation occurs before Redux has
   * updated the props of the Editor component
   *
   * This may pose a problem if the user clicks 'Save and Continue'
   * and the saving process fails. The prompt would no longer
   * appear although there exist unsaved changes
   */
  const [currentlySaving, setCurrentlySaving] = useState(false);
  const [isSaveInFlight, setIsSaveInFlight] = useState(false);

  useEffect(() => {
    gradingSaveResultRef.current = gradingSaveResult;
  }, [gradingSaveResult]);

  useEffect(() => {
    makeInitialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.submissionId, props.questionId]);

  // Unlock save controls once Redux props refresh after a save cycle.
  useEffect(() => {
    saveInFlightRef.current = false;
    setIsSaveInFlight(false);
    setCurrentlySaving(false);

    if (saveAndContinueTimeoutRef.current !== undefined) {
      window.clearTimeout(saveAndContinueTimeoutRef.current);
      saveAndContinueTimeoutRef.current = undefined;
    }
    if (saveTimeoutRef.current !== undefined) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
    }
  }, [props.comments, props.xpAdjustment, props.gradedAt, props.submissionId, props.questionId]);

  useEffect(() => {
    if (
      !gradingSaveResult ||
      gradingSaveResult.submissionId !== props.submissionId ||
      gradingSaveResult.questionId !== props.questionId
    ) {
      return;
    }

    // Ignore stale save results when the editor is (re)mounted without an active save.
    if (!saveInFlightRef.current && !currentlySaving) {
      return;
    }

    saveInFlightRef.current = false;
    setIsSaveInFlight(false);

    if (saveAndContinueTimeoutRef.current !== undefined) {
      window.clearTimeout(saveAndContinueTimeoutRef.current);
      saveAndContinueTimeoutRef.current = undefined;
    }
    if (saveTimeoutRef.current !== undefined) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
    }

    if (gradingSaveResult.success) {
      const currentSelectionKey = buildSelectionKey(
        selectedCommentsRef.current,
        suggestionsRef.current
      );
      initialSelectionKeyRef.current = currentSelectionKey;
      lastSavedSelectionKeyRef.current = currentSelectionKey;
    }

    if (!gradingSaveResult.success || !gradingSaveResult.saveAndContinue) {
      setCurrentlySaving(false);
    }
  }, [gradingSaveResult, currentlySaving, props.questionId, props.submissionId]);

  const buildSelectionPayload = (selected: SelectedComment[], sourceSuggestions: string[]) => {
    const sorted = [...selected].sort((a, b) => a.originalIndex - b.originalIndex);
    const selectedIndices = sorted.map(comment => comment.originalIndex);
    const changedEdits: Record<number, string> = {};

    sorted.forEach(comment => {
      const original = sourceSuggestions[comment.originalIndex] ?? '';
      if (comment.text !== original) {
        changedEdits[comment.originalIndex] = comment.text;
      }
    });

    return { selectedIndices, changedEdits };
  };

  const updatePersistedAiSelectionSnapshot = (
    selected: SelectedComment[],
    sourceSuggestions: string[]
  ) => {
    const sanitizedSelectedComments = selected
      .filter(
        comment => comment.originalIndex >= 0 && comment.originalIndex < sourceSuggestions.length
      )
      .map(comment => {
        const original = sourceSuggestions[comment.originalIndex] ?? '';
        const text = normalizeCommentText(comment.text);
        return {
          originalIndex: comment.originalIndex,
          text,
          isEdited: text !== original
        };
      })
      .sort((a, b) => a.originalIndex - b.originalIndex);

    const { selectedIndices, changedEdits } = buildSelectionPayload(
      sanitizedSelectedComments,
      sourceSuggestions
    );

    persistedAiSelectionRef.current = {
      selectionKey: JSON.stringify({
        selected_indices: selectedIndices,
        edits: changedEdits
      }),
      selectedComments: sanitizedSelectedComments,
      suggestions: [...sourceSuggestions]
    };
  };

  const getPersistedAiSelectionSnapshot = (): PersistedAiSelectionState => ({
    selectionKey: persistedAiSelectionRef.current.selectionKey,
    selectedComments: persistedAiSelectionRef.current.selectedComments.map(comment => ({
      ...comment
    })),
    suggestions: [...persistedAiSelectionRef.current.suggestions]
  });

  const buildSelectionKey = (selected: SelectedComment[], sourceSuggestions: string[]) => {
    const payload = buildSelectionPayload(selected, sourceSuggestions);
    return JSON.stringify({
      selected_indices: payload.selectedIndices,
      edits: payload.changedEdits
    });
  };

  const syncAiCommentsToStore = (selected: SelectedComment[], sourceSuggestions: string[]) => {
    if (!currentGrading) {
      return;
    }

    const { selectedIndices, changedEdits } = buildSelectionPayload(selected, sourceSuggestions);
    const updatedAnswers = currentGrading.answers.map(answer => {
      if (answer.question.id !== props.questionId) {
        return answer;
      }

      return {
        ...answer,
        ai_comments: {
          comments: sourceSuggestions,
          selectedIndices,
          selectedEdits: changedEdits
        }
      };
    });

    dispatch(
      SessionActions.updateGrading(props.submissionId, {
        ...currentGrading,
        answers: updatedAnswers
      })
    );
  };

  const waitForGradingSaveResult = (saveAndContinue: boolean) => {
    const lastRequestId = gradingSaveResultRef.current?.requestId ?? 0;
    return new Promise<boolean>(resolve => {
      const startedAt = Date.now();
      const maxWaitMs = 15000;
      const pollIntervalMs = 100;
      const interval = window.setInterval(() => {
        const result = gradingSaveResultRef.current;
        const timedOut = Date.now() - startedAt >= maxWaitMs;

        if (
          result &&
          result.submissionId === props.submissionId &&
          result.questionId === props.questionId &&
          result.saveAndContinue === saveAndContinue &&
          result.requestId > lastRequestId
        ) {
          window.clearInterval(interval);
          resolve(result.success);
          return;
        }

        if (timedOut) {
          window.clearInterval(interval);
          resolve(false);
        }
      }, pollIntervalMs);
    });
  };

  const onToggleComment = (index: number) => {
    setSelectedComments(prev => {
      const alreadySelected = prev.some(comment => comment.originalIndex === index);
      if (alreadySelected) {
        return prev.filter(comment => comment.originalIndex !== index);
      }

      const original = suggestions[index] ?? '';
      return [
        ...prev,
        { originalIndex: index, text: normalizeCommentText(original), isEdited: false }
      ].sort((a, b) => a.originalIndex - b.originalIndex);
    });
  };

  const onSelectedCommentTextChange = (originalIndex: number, text: string) => {
    const normalizedText = normalizeCommentText(text);
    setSelectedComments(prev =>
      prev.map(comment => {
        if (comment.originalIndex !== originalIndex) {
          return comment;
        }
        const original = suggestions[originalIndex] ?? '';
        return { ...comment, text: normalizedText, isEdited: normalizedText !== original };
      })
    );

    window.requestAnimationFrame(() => {
      const textarea = aiCommentTextareaRefs.current[originalIndex];
      if (!textarea) {
        return;
      }

      textarea.style.height = '0px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  };

  const postSaveChosenComments = async (): Promise<boolean> => {
    // Only persist AI selections when this answer has generated suggestions.
    if (!props.is_llm || suggestions.length === 0) {
      return true;
    }

    const { selectedIndices, changedEdits } = buildSelectionPayload(selectedComments, suggestions);
    const currentSelectionKey = JSON.stringify({
      selected_indices: selectedIndices,
      edits: changedEdits
    });

    // Avoid rewriting identical selection state on repeated saves.
    if (currentSelectionKey === lastSavedSelectionKeyRef.current) {
      return true;
    }

    const resp = await saveChosenComments(tokens, props.answer_id, selectedIndices, changedEdits);

    if (!resp || !resp.ok) {
      showWarningMessage('Failed to save selected AI comments. Please try again.');
      return false;
    }

    lastSavedSelectionKeyRef.current = currentSelectionKey;
    updatePersistedAiSelectionSnapshot(selectedComments, suggestions);

    return true;
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedComments, setSelectedComments] = useState<SelectedComment[]>([]);
  const [hasClickedGenerate, setHasClickedGenerate] = useState<boolean>(false);
  const [isViewLLMPromptOpen, setIsViewLLMPromptOpen] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false); //If generate comments button has been pressed

  useEffect(() => {
    selectedCommentsRef.current = selectedComments;
  }, [selectedComments]);

  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);

  useEffect(() => {
    selectedComments.forEach(comment => {
      const textarea = aiCommentTextareaRefs.current[comment.originalIndex];
      if (!textarea) {
        return;
      }

      textarea.style.height = '0px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [selectedComments]);

  const makeInitialState = () => {
    setXpAdjustmentInput(props.xpAdjustment.toString());
    setSelectedTab('write');
    setCurrentlySaving(false);
    // Load existing AI comments from props (the database)
    const existingComments = props.ai_comments?.comments || [];
    const persistedSelectedIndices = props.ai_comments?.selectedIndices || [];
    const persistedSelectedEdits = props.ai_comments?.selectedEdits || {};
    const hydratedSelectedComments = hydrateSelectedComments(
      existingComments,
      persistedSelectedIndices,
      persistedSelectedEdits
    );

    setUserText(props.comments);
    setSuggestions(existingComments);
    // Lock the button if we already have comments for this submission
    setHasGenerated(existingComments.length > 0);
    setSelectedComments(hydratedSelectedComments);
    updatePersistedAiSelectionSnapshot(hydratedSelectedComments, existingComments);
    const persistedSelectionKey = buildSelectionKey(hydratedSelectedComments, existingComments);
    initialSelectionKeyRef.current = persistedSelectionKey;
    lastSavedSelectionKeyRef.current = persistedSelectionKey;
    if (saveAndContinueTimeoutRef.current !== undefined) {
      window.clearTimeout(saveAndContinueTimeoutRef.current);
      saveAndContinueTimeoutRef.current = undefined;
    }
  };

  /**
   * A custom icons provider. It uses a bulky mapping function
   * defined below.
   *
   * See {@link https://github.com/andrerpena/react-mde}
   */
  function blueprintIconProvider(name: string) {
    const blueprintIcon = mdeToBlueprintIconMapping(name);
    return <Icon icon={blueprintIcon.iconName} htmlTitle={blueprintIcon.title} />;
  }

  /**
   * Makes sure that the XP values are permissible before
   * returning the relevant saving function (for the 'Save Draft'
   * and 'Submit and Continue' buttons)
   */
  const validateXpBeforeSave =
    (handleSaving: GradingSaveFunction): (() => void) =>
    async () => {
      if (saveInFlightRef.current) {
        return;
      }

      const newXpAdjustmentInput = convertParamToInt(xpAdjustmentInput || undefined) || undefined;
      const xp = props.initialXp + (newXpAdjustmentInput || 0);

      if (xp < 0 || xp > props.maxXp) {
        showWarningMessage(
          `XP ${xp.toString()} is out of bounds. Maximum xp is ${props.maxXp.toString()}.`
        );
        return;
      }

      const cleanedEditorValue = userText;

      setCurrentlySaving(true);
      saveInFlightRef.current = true;
      setIsSaveInFlight(true);

      const saveAndContinue = handleSaving === onClickSaveAndContinue;
      const previousPersistedSelection = getPersistedAiSelectionSnapshot();
      const { selectedIndices: previousSelectedIndices, changedEdits: previousChangedEdits } =
        buildSelectionPayload(
          previousPersistedSelection.selectedComments,
          previousPersistedSelection.suggestions
        );

      const hasSavedChosenComments = await postSaveChosenComments();
      if (!hasSavedChosenComments) {
        saveInFlightRef.current = false;
        setIsSaveInFlight(false);
        setCurrentlySaving(false);

        if (saveAndContinueTimeoutRef.current !== undefined) {
          window.clearTimeout(saveAndContinueTimeoutRef.current);
          saveAndContinueTimeoutRef.current = undefined;
        }
        return;
      }

      // Keep the in-memory grading state aligned with the latest saved AI selection
      // so leaving and re-entering preserves selected comments and edits.
      syncAiCommentsToStore(selectedComments, suggestions);

      handleSaving(props.submissionId, props.questionId, newXpAdjustmentInput, cleanedEditorValue);

      const gradingSaved = await waitForGradingSaveResult(saveAndContinue);
      if (!gradingSaved) {
        const currentSelectionKey = buildSelectionKey(selectedComments, suggestions);
        if (currentSelectionKey !== previousPersistedSelection.selectionKey) {
          const rollbackResp = await saveChosenComments(
            tokens,
            props.answer_id,
            previousSelectedIndices,
            previousChangedEdits
          );

          if (rollbackResp && rollbackResp.ok) {
            lastSavedSelectionKeyRef.current = previousPersistedSelection.selectionKey;
            initialSelectionKeyRef.current = previousPersistedSelection.selectionKey;
            updatePersistedAiSelectionSnapshot(
              previousPersistedSelection.selectedComments,
              previousPersistedSelection.suggestions
            );
            syncAiCommentsToStore(
              previousPersistedSelection.selectedComments,
              previousPersistedSelection.suggestions
            );
            showWarningMessage(
              'Failed to save grading. Reverted AI comment selection to last saved state.'
            );
          } else {
            showWarningMessage(
              'Failed to save grading, and failed to rollback AI comment selection. Please refresh and retry.'
            );
          }
        }
      } else {
        // Mark AI selection as clean after full grading save succeeds.
        const currentSelectionKey = buildSelectionKey(selectedComments, suggestions);
        initialSelectionKeyRef.current = currentSelectionKey;
        lastSavedSelectionKeyRef.current = currentSelectionKey;
      }
    };

  /**
   * Sets the state currentlySaving to true to disable
   * the 'You have unsaved changes' prompt
   */
  const onClickSaveAndContinue: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const callback = (): void => {
      handleGradingSaveAndContinue(submissionId, questionId, xpAdjustment, comments!);
    };
    setCurrentlySaving(true);
    if (saveAndContinueTimeoutRef.current !== undefined) {
      window.clearTimeout(saveAndContinueTimeoutRef.current);
    }
    if (saveTimeoutRef.current !== undefined) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
    }
    // Fallback to avoid suppressing the unsaved-changes prompt indefinitely if save fails.
    saveAndContinueTimeoutRef.current = window.setTimeout(() => {
      setCurrentlySaving(false);
      saveInFlightRef.current = false;
      setIsSaveInFlight(false);
      saveAndContinueTimeoutRef.current = undefined;
    }, 15000);
    // TODO: Check (not sure how) if this results in a regression.
    callback();
  };

  const onClickSaveChanges: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const callback = (): void => {
      handleGradingSave(submissionId, questionId, xpAdjustment, comments!);
    };
    // Fallback timeout to unlock save controls if Redux state update doesn't occur
    // (e.g., if grading saga fails unexpectedly)
    if (saveTimeoutRef.current !== undefined) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      setCurrentlySaving(false);
      saveInFlightRef.current = false;
      setIsSaveInFlight(false);
      saveTimeoutRef.current = undefined;
    }, 15000);
    callback();
  };

  const onClickReautogradeAnswer = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: (
        <>
          <p>Reautograde this answer?</p>
          <p>Note: manual adjustments will be reset to 0.</p>
        </>
      ),
      positiveLabel: 'Reautograde',
      positiveIntent: 'danger'
    });
    if (confirm) {
      handleReautogradeAnswer(props.submissionId, props.questionId);
    }
  };

  /**
   * Send a warning prompt that loading from a local draft
   * will overwrite any unsaved changes
   */
  const discardChanges = (): void => {
    if (!checkHasUnsavedChanges() || window.confirm('This will reset the editor. Are you sure?')) {
      makeInitialState();
      showSuccessMessage('Discarded!', 1000);
    }
  };

  /**
   * Handles changes in the XP NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  const onXpAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    setXpAdjustmentInput(valueAsString);
  };

  const checkHasUnsavedChanges = () => {
    const newXpAdjustmentInput = convertParamToInt(xpAdjustmentInput || undefined);
    const hasTextChanges = props.comments !== userText;
    const hasSelectionChanges =
      buildSelectionKey(selectedComments, suggestions) !== initialSelectionKeyRef.current;
    return props.xpAdjustment !== newXpAdjustmentInput || hasTextChanges || hasSelectionChanges;
  };

  const checkIsNewQuestion = () => {
    return props.gradedAt === undefined;
  };

  const generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(
      <Markdown
        content={markdown}
        simplifiedAutoLink
        strikethrough
        tasklists
        openLinksInNewWindow
      />
    );

  const copyComposedPromptToClipboard = () => {
    navigator.clipboard.writeText(
      prompts
        .map(prompt => {
          return `**${prompt.role} Prompt**\n\n${prompt.content}`;
        })
        .join('\n\n')
    );
    showSuccessMessage('Composed prompt copied to clipboard!', 2000);
  };

  // Render
  const hasUnsavedChanges = checkHasUnsavedChanges();
  const isNewQuestion = checkIsNewQuestion();
  const saveButtonOpts = {
    intent: hasUnsavedChanges || isNewQuestion ? Intent.WARNING : Intent.NONE,
    minimal: !hasUnsavedChanges && !isNewQuestion,
    disabled: isSaveInFlight,
    className: gradingEditorButtonClass
  };
  const discardButtonOpts = {
    intent: hasUnsavedChanges ? Intent.DANGER : Intent.NONE,
    minimal: !hasUnsavedChanges,
    disabled: isSaveInFlight,
    className: gradingEditorButtonClass
  };
  const saveAndContinueButtonOpts = {
    intent: hasUnsavedChanges || isNewQuestion ? Intent.SUCCESS : Intent.NONE,
    minimal: !hasUnsavedChanges && !isNewQuestion,
    disabled: isSaveInFlight,
    className: gradingEditorButtonClass
  };
  const onTabChange = (tab: ReactMdeProps['selectedTab']) => setSelectedTab(tab);

  // Derived values
  const totalXp = props.initialXp + (convertParamToInt(xpAdjustmentInput || undefined) || 0);
  const xpPlaceholder = `${props.initialXp > 0 ? '-' : ''}${props.initialXp} to ${
    props.maxXp - props.initialXp
  }`;

  const handleGenerate = async (force: boolean = false) => {
    if (force) {
      const confirm = await showSimpleConfirmDialog({
        contents: (
          <>
            <p>Are you sure? Doing so will result in the previous prompt results being lost.</p>
            <p>
              <b>Note: This will incur additional LLM token costs.</b>
            </p>
          </>
        ),
        positiveLabel: 'Re-generate',
        positiveIntent: Intent.DANGER
      });

      if (!confirm) return;
    }

    setHasClickedGenerate(true);

    try {
      const resp = await postGenerateComments(tokens, props.answer_id, force);

      if (resp && resp.comments) {
        setSuggestions(resp.comments);
        setHasGenerated(true);
        setSelectedComments([]);
        updatePersistedAiSelectionSnapshot([], resp.comments);
        initialSelectionKeyRef.current = EMPTY_SELECTION_SAVE_KEY;

        showSuccessMessage(force ? 'Comments re-generated!' : 'Comments generated!');
      }
    } catch (error) {
      showWarningMessage('Failed to generate comments. Please try again.');
    } finally {
      setHasClickedGenerate(false);
    }
  };

  return (
    <div className="GradingEditor">
      <Prompt
        when={!currentlySaving && !isSaveInFlight && hasUnsavedChanges}
        message={'You have unsaved changes. Are you sure you want to leave?'}
      />

      <div className="grading-editor-header">
        <H3>
          Currently Grading:
          <br />
          {props.studentNames.map((name, index) => (
            <div key={index}>
              <span>
                {name} ({props.studentUsernames[index]})
              </span>
              <br />
            </div>
          ))}
        </H3>
      </div>
      {props.solution !== null ? (
        <div className="grading-editor-marking-scheme">
          <Pre>{props.solution.toString()} </Pre>
        </div>
      ) : null}

      <div className="grading-editor-container">
        <div className="grading-editor-xp">
          <div className="autograder-xp">
            <div>Autograder XP:</div>
            <div>
              {`${props.initialXp} / ${props.maxXp}`}{' '}
              <Button icon="refresh" small minimal onClick={onClickReautogradeAnswer}></Button>
            </div>
          </div>
          <div className="xp-adjustment">
            <div>XP adjustment:</div>
            <div>
              <NumericInput
                className="adjustment-input"
                onValueChange={onXpAdjustmentInputChange}
                value={xpAdjustmentInput || ''}
                buttonPosition={Position.RIGHT}
                fill={true}
                placeholder={xpPlaceholder}
                intent={totalXp < 0 || totalXp > props.maxXp ? Intent.DANGER : Intent.NONE}
                min={0 - props.initialXp}
                max={props.maxXp > props.initialXp ? props.maxXp - props.initialXp : undefined}
                stepSize={50}
                minorStepSize={25}
                majorStepSize={100}
              />
            </div>
          </div>
          <div className="final-xp">
            <div>Final XP:</div>
            <div>{`${totalXp} / ${props.maxXp}`}</div>
          </div>
        </div>
      </div>

      {props.is_llm && (
        <>
          {hasPrompts && (
            <Dialog
              title="Full Composed LLM Prompt"
              icon={IconNames.WRENCH}
              isOpen={isViewLLMPromptOpen}
              onClose={() => setIsViewLLMPromptOpen(false)}
            >
              <div className="llm-prompt-dialog">
                <div className="forenote-section">
                  <span className="forenote">
                    <b>Note:</b> The titles here are provided merely to distinguish the different
                    sections. They are not included in the final prompt.
                  </span>
                  <Button
                    onClick={() => {
                      copyComposedPromptToClipboard();
                    }}
                  >
                    <Icon icon={IconNames.Clipboard} />
                  </Button>
                </div>
                {prompts.map(prompt => {
                  return (
                    <>
                      <H3>{prompt.role} Level Prompt</H3>
                      <Divider />
                      {prompt.content}
                    </>
                  );
                })}
              </div>
            </Dialog>
          )}
          <div style={{ marginBottom: '10px' }}>
            <GradingCommentSelector
              onToggle={onToggleComment}
              isLoading={hasClickedGenerate}
              comments={suggestions}
              selectedIndices={selectedComments.map(comment => comment.originalIndex)}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {hasPrompts && (
                <Button
                  onClick={async () => {
                    setIsViewLLMPromptOpen(true);
                  }}
                >
                  View Prompt
                </Button>
              )}

              {hasPrompts && (
                <Button
                  intent={hasGenerated ? Intent.NONE : Intent.PRIMARY}
                  loading={hasClickedGenerate}
                  disabled={hasClickedGenerate}
                  onClick={() => handleGenerate(hasGenerated)}
                >
                  {hasGenerated ? 'Re-generate Comments' : 'Generate Comments'}
                </Button>
              )}

              <LLMFeedbackButton
                tokens={tokens}
                assessmentId={props.assessmentId}
                questionId={props.questionId}
              />
            </div>
          </div>
        </>
      )}

      <div
        className={`react-mde-parent grading-editor-writing-surface${
          selectedComments.length > 0 ? ' with-ai-comments' : ''
        }`}
      >
        <ReactMde
          value={userText}
          onChange={setUserText}
          selectedTab={selectedTab}
          onTabChange={onTabChange}
          generateMarkdownPreview={generateMarkdownPreview}
          minEditorHeight={200}
          maxEditorHeight={1000}
          minPreviewHeight={240}
          getIcon={blueprintIconProvider}
        />

        {selectedComments.length > 0 && (
          <div className="grading-editor-ai-comment-blocks">
            {selectedComments
              .slice()
              .sort((a, b) => a.originalIndex - b.originalIndex)
              .map(comment => (
                <textarea
                  className="grading-editor-ai-comment-input"
                  ref={node => {
                    aiCommentTextareaRefs.current[comment.originalIndex] = node;
                  }}
                  key={comment.originalIndex}
                  value={comment.text}
                  onChange={event =>
                    onSelectedCommentTextChange(comment.originalIndex, event.target.value)
                  }
                  rows={1}
                  style={{
                    outline: 'none',
                    resize: 'none',
                    margin: 0,
                    display: 'block',
                    width: '100%',
                    overflow: 'hidden'
                  }}
                />
              ))}
          </div>
        )}
      </div>

      {selectedTab === 'write' && (
        <div className="grading-editor-draft-buttons">
          <div className="grading-editor-save-button">
            <ControlButton
              label="Save Changes"
              icon={IconNames.FLOPPY_DISK}
              onClick={validateXpBeforeSave(onClickSaveChanges)}
              options={saveButtonOpts}
            />
          </div>
          <div className="grading-editor-discard-button">
            <ControlButton
              label="Discard Changes"
              icon={IconNames.TRASH}
              onClick={discardChanges}
              options={discardButtonOpts}
            />
          </div>
        </div>
      )}
      <div className="grading-editor-save-continue-button">
        <ControlButton
          label="Save and Continue"
          icon={IconNames.UPDATED}
          onClick={validateXpBeforeSave(onClickSaveAndContinue)}
          options={saveAndContinueButtonOpts}
        />
      </div>
      {props.graderName && props.gradedAt && (
        <>
          <Divider />
          <div className="grading-editor-last-graded-details">
            Last edited by <b>{props.graderName}</b> on {getPrettyDate(props.gradedAt)}
          </div>
        </>
      )}
    </div>
  );
};

const mdeToBlueprintIconMap: Readonly<Record<string, readonly [IconName, string?]>> = {
  header: [IconNames.HEADER, 'Header Styles'],
  bold: [IconNames.BOLD, 'Bold'],
  italic: [IconNames.ITALIC, 'Italic'],
  strikethrough: [IconNames.STRIKETHROUGH, 'Strikethrough'],
  link: [IconNames.LINK, 'Link'],
  quote: [IconNames.CITATION, 'Quote'],
  code: [IconNames.CODE, 'Monospaced'],
  image: [IconNames.MEDIA, 'Image'],
  'unordered-list': [IconNames.UNGROUP_OBJECTS, 'Bullets'],
  'ordered-list': [IconNames.NUMBERED_LIST, 'Numbering'],
  'checked-list': [IconNames.SQUARE, 'Checkboxes']
} as const;

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
    case 'bold':
    case 'italic':
    case 'strikethrough':
    case 'link':
    case 'quote':
    case 'code':
    case 'image':
    case 'unordered-list':
    case 'ordered-list':
    case 'checked-list': {
      const [iconName, title] = mdeToBlueprintIconMap[name];
      return { iconName, title };
    }
    default:
      // For unknown icons, a question mark icon is returned
      return {
        iconName: IconNames.HELP
      };
  }
};

export default GradingEditor;
