import {
  Button,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
  NonIdealState,
  Position,
  Spinner,
  Text,
  Tooltip
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { sortBy } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useLoaderData, useParams } from 'react-router';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import Messages, { sendToWebview } from 'src/features/vscode/messages';

import SessionActions from '../application/actions/SessionActions';
import { Role } from '../application/ApplicationTypes';
import AssessmentWorkspace, {
  AssessmentWorkspaceProps
} from '../assessmentWorkspace/AssessmentWorkspace';
import ContentDisplay from '../ContentDisplay';
import ControlButton from '../ControlButton';
import Constants from '../utils/Constants';
import { beforeNow } from '../utils/DateHelper';
import { useSession, useTypedSelector } from '../utils/Hooks';
import { convertParamToInt } from '../utils/ParamParseHelper';
import AssessmentNotFound from './AssessmentNotFound';
import AssessmentOverviewCard from './AssessmentOverviewCard';
import {
  AssessmentConfiguration,
  AssessmentOverview,
  AssessmentStatuses,
  AssessmentWorkspaceParams
} from './AssessmentTypes';

const Assessment: React.FC = () => {
  const params = useParams<AssessmentWorkspaceParams>();
  const [betchaAssessment, setBetchaAssessment] = useState<AssessmentOverview | null>(null);
  const [showClosedAssessments, setShowClosedAssessments] = useState(false);
  const [showOpenedAssessments, setShowOpenedAssessments] = useState(true);
  const [showUpcomingAssessments, setShowUpcomingAssessments] = useState(true);

  const { courseId, role, assessmentOverviews: assessmentOverviewsUnfiltered } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (assessmentOverviewsUnfiltered && courseId) {
      sendToWebview(
        Messages.NotifyAssessmentsOverview(
          assessmentOverviewsUnfiltered.map(oa => ({
            type: oa.type,
            closeAt: oa.closeAt,
            id: oa.id,
            isPublished: oa.isPublished,
            title: oa.title
          })),
          courseId
        )
      );
    }
  }, [assessmentOverviewsUnfiltered, courseId]);

  const toggleClosedAssessments = () => setShowClosedAssessments(!showClosedAssessments);
  const toggleOpenAssessments = () => setShowOpenedAssessments(!showOpenedAssessments);
  const toggleUpcomingAssessments = () => setShowUpcomingAssessments(!showUpcomingAssessments);
  const setBetchaAssessmentNull = () => setBetchaAssessment(null);
  const handleSubmitAssessment = () => {
    if (betchaAssessment) {
      dispatch(SessionActions.submitAssessment(betchaAssessment.id));
      setBetchaAssessmentNull();
    }
  };

  const sortAssessments = (assessments: AssessmentOverview[]) => sortBy(assessments, [a => -a.id]);

  const makeSubmissionButton = (overview: AssessmentOverview) => (
    <Tooltip
      disabled={overview.status === AssessmentStatuses.attempted}
      content={'You can finalize after saving an answer for each question!'}
      position={Position.RIGHT}
    >
      <Button
        disabled={overview.status !== AssessmentStatuses.attempted}
        icon={IconNames.CONFIRM}
        intent={overview.status === AssessmentStatuses.attempted ? Intent.DANGER : Intent.NONE}
        variant="minimal"
        // intentional: each listing renders its own version of onClick
        // tslint:disable-next-line:jsx-no-lambda
        onClick={() => setBetchaAssessment(overview)}
      >
        <span>Finalize</span>
        <span className="custom-hidden-xxs"> Submission</span>
      </Button>
    </Tooltip>
  );

  // Rendering Logic
  const assessmentConfigToLoad = useLoaderData() as AssessmentConfiguration;
  const assessmentOverviews = useMemo(
    () => assessmentOverviewsUnfiltered?.filter(ao => ao.type === assessmentConfigToLoad.type),
    [assessmentConfigToLoad.type, assessmentOverviewsUnfiltered]
  );

  const fromLeaderboard: boolean = useTypedSelector(store => store.leaderboard.code) ? true : false;

  // If assessmentId or questionId is defined but not numeric, redirect back to the Assessment overviews page
  if (
    (params.assessmentId && !params.assessmentId?.match(numberRegExp)) ||
    (params.questionId && !params.questionId?.match(numberRegExp))
  ) {
    return <Navigate to={`/courses/${courseId}/${assessmentConfigToLoad.type}`} />;
  }

  const assessmentId: number | null = convertParamToInt(params.assessmentId);
  const questionId: number = convertParamToInt(params.questionId) || Constants.defaultQuestionId;

  // If there is an assessment to render, create a workspace. The assessment
  // overviews must still be loaded for this, to send the due date.
  if (assessmentId !== null && assessmentOverviews !== undefined) {
    const overview = assessmentOverviews.filter(a => a.id === assessmentId)[0];
    if (!overview) {
      return <AssessmentNotFound />;
    }

    const notAttempted = overview.status === AssessmentStatuses.not_attempted;
    const assessmentWorkspaceProps: AssessmentWorkspaceProps = {
      assessmentId,
      questionId,
      notAttempted,
      needsPassword: !!overview.private && notAttempted,
      canSave:
        role !== Role.Student ||
        (overview.status !== AssessmentStatuses.submitted && !beforeNow(overview.closeAt)),
      assessmentConfiguration: assessmentConfigToLoad,
      fromContestLeaderboard: fromLeaderboard
    };
    return <AssessmentWorkspace {...assessmentWorkspaceProps} />;
  }

  // Otherwise, render a list of assOwnProps
  let display: JSX.Element;
  if (assessmentOverviews === undefined) {
    display = <NonIdealState description="Fetching assessment..." icon={<Spinner />} />;
  } else if (assessmentOverviews.length === 0) {
    display = <NonIdealState title="There are no assessments." icon={IconNames.FLAME} />;
  } else {
    /** Upcoming assessments, that are not released yet. */
    const isOverviewUpcoming = (overview: AssessmentOverview) =>
      !beforeNow(overview.closeAt) && !beforeNow(overview.openAt);
    const upcomingCards = sortAssessments(assessmentOverviews.filter(isOverviewUpcoming)).map(
      overview => (
        <AssessmentOverviewCard
          key={overview.id}
          overview={overview}
          renderAttemptButton={role !== Role.Student}
          renderGradingTooltip={false}
          makeSubmissionButton={makeSubmissionButton}
        />
      )
    );

    /** Opened assessments, that are released and can be attempted. */
    const isOverviewOpened = (overview: AssessmentOverview) =>
      !beforeNow(overview.closeAt) &&
      beforeNow(overview.openAt) &&
      overview.status !== AssessmentStatuses.submitted;
    const openedCards = sortAssessments(
      assessmentOverviews.filter(overview => isOverviewOpened(overview))
    ).map(overview => (
      <AssessmentOverviewCard
        key={overview.id}
        overview={overview}
        renderAttemptButton
        renderGradingTooltip={false}
        makeSubmissionButton={makeSubmissionButton}
      />
    ));

    /** Closed assessments, that are past the due date or cannot be attempted further. */
    const closedCards = sortAssessments(
      assessmentOverviews.filter(
        overview => !isOverviewOpened(overview) && !isOverviewUpcoming(overview)
      )
    ).map(overview => (
      <AssessmentOverviewCard
        key={overview.id}
        overview={overview}
        renderAttemptButton
        renderGradingTooltip
        makeSubmissionButton={makeSubmissionButton}
      />
    ));

    /** Render cards */
    const upcomingCardsCollapsible = (
      <>
        {collapseButton('Upcoming', showUpcomingAssessments, toggleUpcomingAssessments)}
        <Collapse isOpen={showUpcomingAssessments}>{upcomingCards}</Collapse>
      </>
    );

    const openedCardsCollapsible = (
      <>
        {collapseButton('Open', showOpenedAssessments, toggleOpenAssessments)}
        <Collapse isOpen={showOpenedAssessments}>{openedCards}</Collapse>
      </>
    );

    const closedCardsCollapsible = (
      <>
        {collapseButton('Closed', showClosedAssessments, toggleClosedAssessments)}
        <Collapse isOpen={showClosedAssessments}>{closedCards}</Collapse>
      </>
    );

    display = (
      <>
        {upcomingCards.length > 0 ? upcomingCardsCollapsible : null}
        {openedCards.length > 0 ? openedCardsCollapsible : null}
        {closedCards.length > 0 ? closedCardsCollapsible : null}
      </>
    );
  }

  // Define the warning text when finalising submissions
  const hasBonusXp = (betchaAssessment?.earlySubmissionXp as number) > 0;
  const warningText = hasBonusXp ? (
    <p>
      Finalising your submission early grants you additional XP, but{' '}
      <span className="warning">this action is irreversible.</span>
    </p>
  ) : (
    <p>
      Finalising your submission early does not grant you additional XP, and{' '}
      <span className="warning">this action is irreversible.</span>
    </p>
  );

  // Define the betcha dialog (in each card's menu)
  const submissionText = betchaAssessment ? (
    <p>
      You are about to finalise your submission for the {betchaAssessment.type.toLowerCase()}{' '}
      <i>&quot;{betchaAssessment.title}&quot;</i>.
    </p>
  ) : (
    <p>You are about to finalise your submission.</p>
  );
  const betchaText = (
    <>
      {submissionText}
      {warningText}
    </>
  );
  const betchaDialog = (
    <Dialog
      className="betcha-dialog"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={betchaAssessment !== null}
      onClose={setBetchaAssessmentNull}
      title="Finalise submission?"
    >
      <DialogBody>
        <Text>{betchaText}</Text>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <ControlButton
              label="Cancel"
              onClick={setBetchaAssessmentNull}
              options={{ minimal: false }}
            />
            <ControlButton
              label="Finalise"
              onClick={handleSubmitAssessment}
              options={{ minimal: false, intent: Intent.DANGER }}
            />
          </>
        }
      />
    </Dialog>
  );

  // Finally, render the ContentDisplay.
  return (
    <div className="Assessment">
      <ContentDisplay
        display={display}
        loadContentDispatch={() => dispatch(SessionActions.fetchAssessmentOverviews())}
      />
      {betchaDialog}
    </div>
  );
};

const collapseButton = (label: string, isOpen: boolean, toggleFunc: () => void) => (
  <ControlButton
    label={label}
    icon={isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
    onClick={toggleFunc}
    options={{ minimal: true, className: 'collapse-button' }}
  />
);

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Assessment;
Component.displayName = 'Assessment';

export default Assessment;
