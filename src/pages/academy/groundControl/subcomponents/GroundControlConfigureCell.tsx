import {
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  HTMLSelect,
  Intent,
  NumericInput,
  Switch,
  Tooltip,
} from '@blueprintjs/core';
import { IconNames, Team } from '@blueprintjs/icons';
import { useCallback, useMemo, useState } from 'react';

import type { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';
import { useAppSelector } from '../../../../commons/utils/Hooks';
import CalculateContestScoreButton from '../configureControls/CalculateContestScoreButton';
import DispatchContestXpButton from '../configureControls/DispatchContestXpButton';
import ExportScoreLeaderboardButton from '../configureControls/ExportScoreLeaderboardButton';
import ExportVoteLeaderboardButton from '../configureControls/ExportVoteLeaderboardButton';
import AssignEntriesButton from './configureControls/AssignEntriesButton';

type Props = {
  handleConfigureAssessment: (
    id: number,
    hasVotingFeatures: boolean,
    hasTokenCounter: boolean,
    isAutosaveEnabled: boolean,
    languageId: string | null,
    evaluatorId: string | null,
  ) => void;
  handleAssignEntriesForVoting: (id: number) => void;
  data: AssessmentOverview;
};

function ConfigureCell({ handleConfigureAssessment, handleAssignEntriesForVoting, data }: Props) {
  const [isDialogOpen, setDialogState] = useState(false);
  const [hasVotingFeatures, setHasVotingFeatures] = useState(!!data.hasVotingFeatures);
  const [hasTokenCounter, setHasTokenCounter] = useState(!!data.hasTokenCounter);
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(data.isAutosaveEnabled ?? false);
  const [isTeamAssessment, setIsTeamAssessment] = useState(false);
  const [isVotingPublished] = useState(!!data.isVotingPublished);
  const [languageId, setLanguageId] = useState(data.languageId ?? '');
  const [evaluatorId, setEvaluatorId] = useState(data.evaluatorId ?? '');

  const languages = useAppSelector(s => s.languageDirectory.languages);
  const currentLanguage = useMemo(
    () => languages.find(l => l.id === languageId),
    [languages, languageId],
  );
  const evaluators = currentLanguage?.evaluators ?? [];

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  // Switching language invalidates the previously selected evaluator (it belongs to the old language)
  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguageId(e.target.value);
    setEvaluatorId('');
  }, []);
  const handleEvaluatorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEvaluatorId(e.target.value);
  }, []);

  // Updates assessment overview with changes to hasVotingFeatures, hasTokenCounter, isAutosaveEnabled and language config
  const handleConfigure = useCallback(() => {
    const { id } = data;
    handleConfigureAssessment(
      id,
      hasVotingFeatures,
      hasTokenCounter,
      isAutosaveEnabled,
      languageId || null,
      evaluatorId || null,
    );
    handleCloseDialog();
  }, [
    data,
    handleCloseDialog,
    handleConfigureAssessment,
    hasTokenCounter,
    hasVotingFeatures,
    isAutosaveEnabled,
    languageId,
    evaluatorId,
  ]);

  // Toggles in configuration pannel
  const toggleHasTokenCounter = useCallback(() => setHasTokenCounter(prev => !prev), []);
  const toggleVotingFeatures = useCallback(() => setHasVotingFeatures(prev => !prev), []);
  const toggleIsTeamAssessment = useCallback(() => setIsTeamAssessment(prev => !prev), []);
  const toggleIsAutosaveEnabled = useCallback(() => setIsAutosaveEnabled(prev => !prev), []);

  return (
    <>
      <Tooltip content="Configure" placement="top">
        <ControlButton icon={IconNames.COG} onClick={handleOpenDialog} />
      </Tooltip>
      <Dialog
        icon={IconNames.Cog}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Configuring assessment"
        canOutsideClickClose
      >
        <DialogBody>
          <p>
            This <b>configuration tool</b> allows you to fine-tune this assessment. Any changes made
            here will <b>override</b> any assessment configurations in the admin panel.
          </p>
          <div className="general-configs">
            <p>
              <b>General Configurations</b>
            </p>
            <Divider />
            <Switch
              className="has-token-counter"
              checked={hasTokenCounter}
              onChange={toggleHasTokenCounter}
              inline
              label="Enable token counter"
            />
            <Switch
              className="is-autosave-enabled"
              checked={isAutosaveEnabled}
              onChange={toggleIsAutosaveEnabled}
              inline
              label="Enable autosave"
            />
          </div>
          <div className="language-config">
            <p>
              <b>Language Configuration</b>
            </p>
            <Divider />
            <p>
              Leave as <b>Default</b> to keep using the current per-question chapter/variant
              (js-slang).
            </p>
            <HTMLSelect
              className="language-id"
              value={languageId}
              onChange={handleLanguageChange}
              fill
            >
              <option value="">Default (js-slang)</option>
              {languages.map(language => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </HTMLSelect>
            <HTMLSelect
              className="evaluator-id"
              value={evaluatorId}
              onChange={handleEvaluatorChange}
              disabled={!languageId}
              fill
            >
              <option value="">Select an evaluator</option>
              {evaluators.map(evaluator => (
                <option key={evaluator.id} value={evaluator.id}>
                  {evaluator.name}
                </option>
              ))}
            </HTMLSelect>
          </div>
          <div className="team-related-configs">
            <p>
              <b>Team-Related Configurations</b>
            </p>
            <Divider />
            <Switch
              className="is-team-assessment"
              onChange={toggleIsTeamAssessment}
              inline
              label="Is team assessment"
            />
            <Collapse isOpen={isTeamAssessment}>
              <div className="numeric-input-container">
                <Team />
                <p className="max-team-size">Max team size</p>
                <NumericInput />
              </div>
            </Collapse>
          </div>
          <div className="voting-related-configs">
            <p>
              <b>Voting-Related Configurations</b>
            </p>
            <Divider />
            <Switch
              className="has-voting-features"
              checked={hasVotingFeatures}
              onChange={toggleVotingFeatures}
              inline
              label="Enable voting features"
            />
            <Collapse isOpen={hasVotingFeatures}>
              <div className="voting-related-controls">
                <CalculateContestScoreButton assessmentId={data.id} />
                <DispatchContestXpButton assessmentId={data.id} />
                <ExportScoreLeaderboardButton assessmentId={data.id} />
                <ExportVoteLeaderboardButton assessmentId={data.id} />
                <AssignEntriesButton
                  handleAssignEntriesForVoting={handleAssignEntriesForVoting}
                  assessmentId={data.id}
                  isVotingPublished={isVotingPublished}
                />
              </div>
            </Collapse>
          </div>
        </DialogBody>
        <DialogFooter
          actions={
            <ControlButton
              label="Save"
              icon={IconNames.UPLOAD}
              onClick={handleConfigure}
              options={{ variant: 'default', intent: Intent.PRIMARY }}
            />
          }
        />
      </Dialog>
    </>
  );
}

export default ConfigureCell;
