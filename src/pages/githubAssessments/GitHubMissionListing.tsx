import {
  Button,
  Card,
  Divider,
  Elevation,
  H4,
  H6,
  Icon,
  NonIdealState,
  Spinner,
  SpinnerSize,
  TagInput,
  Text
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import ContentDisplay from '../../commons/ContentDisplay';
import {
  getContentAsString,
  parseMetadataProperties
} from '../../commons/githubAssessments/GitHubMissionDataUtils';
import { MissionRepoData } from '../../commons/githubAssessments/GitHubMissionTypes';
import Markdown from '../../commons/Markdown';
import Constants from '../../commons/utils/Constants';
import { history } from '../../commons/utils/HistoryHelper';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import {
  GetContentData,
  GetContentResponse,
  GitHubRepositoryInformation
} from '../../features/github/OctokitTypes';

/**
 * A page that lists the missions available to the authenticated user.
 * This page should only be reachable if using a GitHub-hosted deployment.
 */
const GitHubMissionListing: React.FC<any> = () => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  const [browsableMissions, setBrowsableMissions] = useState<BrowsableMission[]>([]);
  const [display, setDisplay] = useState<JSX.Element>(<></>);

  const octokit: Octokit = useSelector((store: any) => store.session.githubOctokitObject).octokit;

  const [values, setValues] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (octokit === undefined) {
      setDisplay(
        <NonIdealState description="Please sign in to GitHub." icon={IconNames.WARNING_SIGN} />
      );
    } else {
      retrieveBrowsableMissions(octokit, setBrowsableMissions, setDisplay);
    }
  }, [octokit, setBrowsableMissions, setDisplay]);

  useEffect(() => {
    if (browsableMissions.length > 0) {
      const filteredMissions: BrowsableMission[] = [];
      browsableMissions.forEach(mission => {
        if (!filteredMissions.includes(mission) && matchTag(mission, values)) {
          filteredMissions.push(mission);
        }
      });

      function matchTag(mission: BrowsableMission, tags: React.ReactNode[]) {
        let match = false;
        tags.forEach(tag => {
          if (tag !== null && tag !== undefined) {
            if (mission.title.includes(tag.toString())) {
              match = true;
            } else if (mission.webSummary.includes(tag.toString())) {
              match = true;
            } else if (mission.missionRepoData.repoOwner.includes(tag.toString())) {
              match = true;
            }
          }
        });
        return match;
      }

      const handleClear = () => {
        handleChange([]);
      };

      const clearButton = <Button icon={'cross'} minimal={true} onClick={handleClear} />;

      const handleChange = (values: React.ReactNode[]) => {
        setValues(values);
      };

      const tagFilter = (
        <TagInput
          leftIcon={IconNames.FILTER}
          onChange={handleChange}
          placeholder="Separate tags with commas..."
          rightElement={clearButton}
          tagProps={{ minimal: true }}
          values={values}
        />
      );

      const cards =
        values.length === 0
          ? browsableMissions.map(element => convertMissionToCard(element, isMobileBreakpoint))
          : filteredMissions.map(element => convertMissionToCard(element, isMobileBreakpoint));

      setDisplay(
        <>
          {tagFilter}
          <Divider />
          {cards}
        </>
      );
    }
  }, [browsableMissions, isMobileBreakpoint, setDisplay, values]);

  return (
    <div className="Academy">
      <div className="Assessment">
        <ContentDisplay display={display} loadContentDispatch={getGitHubOctokitInstance} />
      </div>
    </div>
  );
};

/**
 * Retrieves BrowsableMissions information from a mission repositories and sets them in the page's state.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param setBrowsableMissions The React setter function for an array of BrowsableMissions
 * @param setDisplay The React setter function for the page's display
 */
async function retrieveBrowsableMissions(
  octokit: Octokit,
  setBrowsableMissions: (browsableMissions: BrowsableMission[]) => void,
  setDisplay: (display: JSX.Element) => void
) {
  if (octokit === undefined) return;

  setDisplay(
    <NonIdealState description="Loading Missions" icon={<Spinner size={SpinnerSize.LARGE} />} />
  );

  const allRepos: GitHubRepositoryInformation[] = (
    await octokit.repos.listForAuthenticatedUser({ per_page: 100 })
  ).data;
  const correctlyNamedRepos = allRepos.filter((repo: GitHubRepositoryInformation) =>
    repo.name.startsWith('sa-')
  );
  const foundMissionRepos: MissionRepoData[] = [];

  for (let i = 0; i < correctlyNamedRepos.length; i++) {
    const repo = correctlyNamedRepos[i];
    const login = (repo.owner as any).login;

    const getContentResponse: GetContentResponse = await octokit.repos.getContent({
      owner: login,
      repo: repo.name,
      path: ''
    });
    const files: GetContentData = getContentResponse.data;

    if (!Array.isArray(files)) {
      setDisplay(<NonIdealState title="There are no assessments." icon={IconNames.FLAME} />);
      return;
    }

    let repositoryContainsMetadataFile = false;
    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      if (file.name === '.metadata') {
        repositoryContainsMetadataFile = true;
        break;
      }
    }

    if (repositoryContainsMetadataFile) {
      const missionRepoData: MissionRepoData = {
        repoOwner: login,
        repoName: repo.name,
        dateOfCreation: new Date(repo.created_at || '')
      };
      foundMissionRepos.push(missionRepoData);
    }
  }

  const browsableMissions: BrowsableMission[] = [];

  for (let i = 0; i < foundMissionRepos.length; i++) {
    browsableMissions.push(await convertRepoToBrowsableMission(foundMissionRepos[i], octokit));
  }

  browsableMissions.sort((a, b) => {
    return a.missionRepoData.dateOfCreation < b.missionRepoData.dateOfCreation ? 1 : -1;
  });

  setBrowsableMissions(browsableMissions);
}

async function convertRepoToBrowsableMission(missionRepo: MissionRepoData, octokit: Octokit) {
  const metadata = await getContentAsString(
    missionRepo.repoOwner,
    missionRepo.repoName,
    '.metadata',
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

/**
 * Maps from a MissionRepoData to a BrowsableMission.
 *
 * @param missionRepo Repository information for a mission repository
 * @param metadata The contents of the '.metadata' file for the same mission repository
 */
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

/**
 * Maps from a BrowsableMission object to a JSX card that can be displayed on the Mission Listing.
 *
 * @param missionRepo The BrowsableMission representation of a single mission repository
 * @param isMobileBreakpoint Whether we are using mobile breakpoint
 */
function convertMissionToCard(missionRepo: BrowsableMission, isMobileBreakpoint: boolean) {
  const ratio = isMobileBreakpoint ? 5 : 3;
  const ownerSlashName =
    missionRepo.missionRepoData.repoOwner + '/' + missionRepo.missionRepoData.repoName;
  const dueDate = missionRepo.dueDate.toDateString();

  const hasDueDate = new Date(8640000000000000) > missionRepo.dueDate;
  const isOverdue = new Date() > missionRepo.dueDate;
  const buttonText = isOverdue ? 'Review Answers' : 'Open';

  const data = missionRepo.missionRepoData;

  const loadIntoEditor = () => history.push(`/githubassessments/editor`, data);

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
}

export default GitHubMissionListing;
