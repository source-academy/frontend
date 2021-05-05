import { Button, Card, Elevation, H4, H6, Icon, NonIdealState, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import ContentDisplay from '../../commons/ContentDisplay';
import {
  getContentAsString,
  parseMetadataProperties
} from '../../commons/githubAssessments/GitHubMissionDataUtils';
import MissionRepoData from '../../commons/githubAssessments/MissionRepoData';
import Markdown from '../../commons/Markdown';
import Constants from '../../commons/utils/Constants';
import { history } from '../../commons/utils/HistoryHelper';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';

export const GitHubMissions: React.FC<any> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  const [missionRepos, setMissionRepos] = useState<MissionRepoData[]>([]);
  const [browsableMissions, setBrowsableMissions] = useState<BrowsableMission[]>([]);

  const octokit = getGitHubOctokitInstance();

  useEffect(() => {
    getMissionRepoData(octokit);
  }, [octokit]);

  useEffect(() => {
    convertMissionReposToBrowsableMissions(octokit, missionRepos);
  }, [octokit, missionRepos]);

  let display: JSX.Element;
  if (octokit === undefined) {
    display = (
      <NonIdealState description="Please sign in to GitHub." icon={IconNames.WARNING_SIGN} />
    );
  } else if (missionRepos.length === 0) {
    display = <NonIdealState title="There are no assessments." icon={IconNames.FLAME} />;
  } else {
    const cards = browsableMissions.map(element =>
      convertMissionToCard(element, octokit, isMobileBreakpoint)
    );
    display = <>{cards}</>;
  }

  // Finally, render the ContentDisplay.
  return (
    <div className="Academy">
      <div className="Assessment">
        <ContentDisplay display={display} loadContentDispatch={getGitHubOctokitInstance} />
      </div>
    </div>
  );

  async function getMissionRepoData(octokit: Octokit) {
    if (octokit === undefined) return;
    const results = await octokit.repos.listForAuthenticatedUser({ per_page: 100 });
    const repos = results.data;
    setMissionRepos(
      repos
        .filter((repo: any) => repo.name.startsWith('SA-'))
        .map((repo: any) => {
          const missionRepoData: MissionRepoData = {
            repoOwner: repo.owner.login,
            repoName: repo.name,
            dateOfCreation: new Date(repo.created_at)
          };
          return missionRepoData;
        }) as MissionRepoData[]
    );
  }

  async function convertMissionReposToBrowsableMissions(
    octokit: Octokit,
    missionRepos: MissionRepoData[]
  ) {
    if (octokit === undefined) return;
    const browsableMissions: BrowsableMission[] = [];

    for (let i = 0; i < missionRepos.length; i++) {
      browsableMissions.push(await convertRepoToBrowsableMission(missionRepos[i], octokit));
    }

    browsableMissions.sort((a, b) => {
      return a.missionRepoData.dateOfCreation < b.missionRepoData.dateOfCreation ? 1 : -1;
    });

    setBrowsableMissions(browsableMissions);
  }
};

async function convertRepoToBrowsableMission(missionRepo: MissionRepoData, octokit: Octokit) {
  const metadata = await getContentAsString(
    missionRepo.repoOwner,
    missionRepo.repoName,
    '/METADATA',
    octokit
  );
  const browsableMission = createBrowsableMission(missionRepo, metadata);

  return browsableMission;
}

type BrowsableMission = {
  title: string;
  coverImage: string;
  webSummary: string;
  missionRepoData: MissionRepoData;
  dueDate: Date;
};

function createBrowsableMission(missionRepo: MissionRepoData, metadata: string) {
  const browsableMission: BrowsableMission = {
    title: '',
    coverImage: '',
    webSummary: '',
    missionRepoData: {
      repoOwner: '',
      repoName: '',
      dateOfCreation: new Date(8640000000000000)
    },
    dueDate: new Date(8640000000000000)
  };

  browsableMission.missionRepoData = missionRepo;

  const stringProps = ['coverImage', 'title', 'webSummary'];
  const dateProps = ['dueDate'];

  const retVal = parseMetadataProperties<BrowsableMission>(
    browsableMission,
    stringProps,
    [],
    dateProps,
    metadata
  );

  return retVal;
}

function convertMissionToCard(
  missionRepo: BrowsableMission,
  octokit: Octokit,
  isMobileBreakpoint: boolean
) {
  const ratio = isMobileBreakpoint ? 5 : 3;
  const ownerSlashName =
    missionRepo.missionRepoData.repoOwner + '/' + missionRepo.missionRepoData.repoName;
  const dueDate = missionRepo.dueDate.toDateString();

  const hasDueDate = new Date(8640000000000000) > missionRepo.dueDate;
  const isOverdue = new Date() > missionRepo.dueDate;
  const buttonText = isOverdue ? 'Review Answers' : 'Open';

  const data = missionRepo.missionRepoData;

  return (
    <div key={ownerSlashName}>
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className={`col-xs-${String(ratio)} listing-picture`}>
          <img
            alt="Assessment"
            className={`cover-image-${missionRepo.title}`}
            src={missionRepo.coverImage ? missionRepo.coverImage : defaultCoverImage}
          />
        </div>

        <div className={`col-xs-${String(12 - ratio)} listing-text`}>
          <div className="listing-header">
            <Text ellipsize={true}>
              <H4 className="listing-title">{missionRepo.title}</H4>
              <H6>{ownerSlashName}</H6>
            </Text>
          </div>

          <div className="listing-description">
            <Markdown content={missionRepo.webSummary} />
          </div>

          <div className="listing-footer">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              {hasDueDate ? 'Due: ' + dueDate : 'No due date'}
            </Text>
            <div className="listing-button">
              <Button icon={IconNames.PLAY} minimal={true} onClick={loadIntoEditor}>
                <span className="custom-hidden-xxxs">{buttonText}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  function loadIntoEditor() {
    history.push(`/githubassessments/editor`, data);
  }
}
