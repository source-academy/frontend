import {
  Button,
  Card,
  Elevation,
  H4,
  H6,
  Icon,
  NonIdealState,
  Spinner,
  Text
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useMemo } from 'react';
import { useResponsive } from 'src/commons/utils/Hooks';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import ContentDisplay from '../../commons/ContentDisplay';
import Markdown from '../../commons/Markdown';
import { history } from '../../commons/utils/HistoryHelper';
import { GHAssessmentOverview } from './GitHubClassroom';

type GitHubAssessmentListingProps = {
  assessmentOverviews?: GHAssessmentOverview[];
  refreshAssessmentOverviews: () => void;
};

/**
 * A page that lists the missions available to the authenticated user.
 * This page should only be reachable if using a GitHub-hosted deployment.
 */
const GitHubAssessmentListing: React.FC<GitHubAssessmentListingProps> = props => {
  const { isMobileBreakpoint } = useResponsive();

  let display: JSX.Element;

  const createAssessmentButton = useMemo(
    () => (
      <Button icon={IconNames.ADD} onClick={() => history.push(`/githubassessments/editor`)}>
        Create a New Assessment!
      </Button>
    ),
    []
  );

  const refreshButton = useMemo(
    () => (
      <Button icon={IconNames.REFRESH} onClick={props.refreshAssessmentOverviews}>
        Refresh Assessments
      </Button>
    ),
    [props.refreshAssessmentOverviews]
  );

  if (!props.assessmentOverviews) {
    display = (
      <>
        {createAssessmentButton}
        <NonIdealState description="Fetching assessment..." icon={<Spinner />} />
      </>
    );
  } else if (props.assessmentOverviews.length === 0) {
    display = (
      <>
        {createAssessmentButton}
        {refreshButton}
        <NonIdealState title="There are no assessments." icon={IconNames.FLAME} />
      </>
    );
  } else {
    // Create cards
    const cards = props.assessmentOverviews.map(element =>
      convertAssessmentOverviewToCard(element, isMobileBreakpoint)
    );
    display = (
      <>
        {createAssessmentButton}
        {refreshButton}
        {cards}
      </>
    );
  }

  return (
    <div className="Assessment" style={{ overflow: 'auto' }}>
      <ContentDisplay display={display} loadContentDispatch={() => {}} />
    </div>
  );
};

/**
 * Maps from a BrowsableMission object to a JSX card that can be displayed on the Mission Listing.
 *
 * @param missionRepo The BrowsableMission representation of a single mission repository
 * @param isMobileBreakpoint Whether we are using mobile breakpoint
 */
function convertAssessmentOverviewToCard(
  assessmentOverview: GHAssessmentOverview,
  isMobileBreakpoint: boolean
) {
  const ratio = isMobileBreakpoint ? 5 : 3;
  const ownerSlashName =
    assessmentOverview.missionRepoData.repoOwner +
    '/' +
    assessmentOverview.missionRepoData.repoName;
  const dueDate = assessmentOverview.dueDate.toDateString();

  const hasDueDate = new Date(8640000000000000) > assessmentOverview.dueDate;
  const isOverdue = new Date() > assessmentOverview.dueDate;

  const assessmentNotAccepted = assessmentOverview.link !== undefined;
  let buttonText = 'Open';
  let handleClick = () => history.push(`/githubassessments/editor`, assessmentOverview);

  if (assessmentNotAccepted) {
    buttonText = 'Accept';
    handleClick = () => window.open(assessmentOverview.link);
  } else if (isOverdue) {
    buttonText = 'Review Answers';
  }

  return (
    <div key={ownerSlashName}>
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className={`col-xs-${String(ratio)} listing-picture`}>
          <img
            alt="Assessment"
            className={`cover-image-${assessmentOverview.title}`}
            src={assessmentOverview.coverImage ? assessmentOverview.coverImage : defaultCoverImage}
          />
        </div>

        <div className={`col-xs-${String(12 - ratio)} listing-text`}>
          <div className="listing-header">
            <Text ellipsize={true}>
              <H4 className="listing-title">{assessmentOverview.title}</H4>
              <H6>{ownerSlashName}</H6>
            </Text>
          </div>

          <div className="listing-description">
            <Markdown content={assessmentOverview.webSummary} />
          </div>

          <div className="listing-footer">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              {hasDueDate ? 'Due: ' + dueDate : 'No due date'}
            </Text>
            <div className="listing-button">
              <Button icon={IconNames.PLAY} minimal={true} onClick={handleClick}>
                <span className="custom-hidden-xxxs">{buttonText}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default GitHubAssessmentListing;
