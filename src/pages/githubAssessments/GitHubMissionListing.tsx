import {
  Button,
  Card,
  Divider,
  Elevation,
  H4,
  H6,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Text
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

// import { RouteComponentProps } from 'react-router';
import defaultCoverImage from '../../assets/default_cover_image.jpg';
import ContentDisplay from '../../commons/ContentDisplay';
import controlButton from '../../commons/ControlButton';
import {
  getContentAsString,
  parseMetadataProperties
} from '../../commons/githubAssessments/GitHubMissionDataUtils';
import { MissionRepoData } from '../../commons/githubAssessments/GitHubMissionTypes';
import Markdown from '../../commons/Markdown';
import GitHubAssessmentsNavigationBar from '../../commons/navigationBar/subcomponents/GitHubAssessmentsNavigationBar';
import Constants from '../../commons/utils/Constants';
import { history } from '../../commons/utils/HistoryHelper';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';

type GitHubMissionListingProps = DispatchProps; //& RouteComponentProps<{ type: string }>

type DispatchProps = {
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

/**
 * A page that lists the missions available to the authenticated user.
 * This page should only be reachable if using a GitHub-hosted deployment.
 */
const GitHubMissionListing: React.FC<GitHubMissionListingProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const octokit: Octokit = useSelector((store: any) => store.session.githubOctokitObject).octokit;

  const [display, setDisplay] = useState<JSX.Element>(<></>);
  const [browsableMissions, setBrowsableMissions] = useState<BrowsableMission[]>([]);
  const [orgList, setOrgList] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [typeNames, setTypeNames] = useState<string[]>([
    'Missions',
    'Quests',
    'Paths',
    'Contests',
    'Others'
  ]);

  // const type = props.match.params.type;
  // console.log(type);

  // After browsable missions retrieved, display mission listing
  useEffect(() => {
    if (octokit === undefined) {
      setDisplay(
        <>
          <NonIdealState description="Please sign in to GitHub." icon={IconNames.WARNING_SIGN} />
          {isMobileBreakpoint &&
            controlButton('Log In', IconNames.GIT_BRANCH, props.handleGitHubLogIn, {
              intent: 'primary',
              minimal: false
            })}
        </>
      );
      return;
    }

    const handleRefresh = () => {
      retrieveOrganizationList(octokit, setOrgList);
      retrieveBrowsableMissions(octokit, setDisplay, selectedOrg, setBrowsableMissions);
      
      // To be removed temp
      setTypeNames(['Mission', 'Quests', 'Paths', 'Contests', 'Others']);
    };

    const refreshButton = <Button icon={IconNames.REFRESH} onClick={handleRefresh} />;

    const handleClick = (e: any) => {
      handleChange(e);
    };

    const handleChange = (e: any) => {
      setSelectedOrg(e.target.innerText);
    };

    const orgSelect = (
      <InputGroup
        disabled={true}
        leftElement={
          <Popover2
            content={
              <Menu>
                {orgList.map((organization: string) => (
                  <MenuItem key={organization} onClick={handleClick} text={organization} />
                ))}
              </Menu>
            }
            placement={'bottom-end'}
          >
            <Button minimal={true} rightIcon="caret-down" />
          </Popover2>
        }
        rightElement={refreshButton}
        onChange={handleChange}
        value={selectedOrg}
      />
    );

    if (browsableMissions.length === 0) {
      setDisplay(
        <>
          {orgSelect}
          <NonIdealState description="No mission repositories found!" icon={IconNames.STAR_EMPTY} />
        </>
      );
      return;
    }

    // Create cards
    const cards = browsableMissions.map(element =>
      convertMissionToCard(element, isMobileBreakpoint)
    );

    setDisplay(
      <>
        {orgSelect}
        <Divider />
        {cards}
        {isMobileBreakpoint &&
          controlButton('Log Out', IconNames.GIT_BRANCH, props.handleGitHubLogOut, {
            intent: 'primary',
            minimal: false
          })}
      </>
    );
  }, [
    browsableMissions,
    isMobileBreakpoint,
    octokit,
    orgList,
    props.handleGitHubLogIn,
    props.handleGitHubLogOut,
    selectedOrg
  ]);

  // Used to retrieve browsable missions
  useEffect(() => {
    if (octokit !== undefined) {
      retrieveOrganizationList(octokit, setOrgList);
      retrieveBrowsableMissions(octokit, setDisplay, selectedOrg, setBrowsableMissions);
    }
  }, [octokit, selectedOrg]);

  return (
    <div className="Academy">
      {!isMobileBreakpoint && <GitHubAssessmentsNavigationBar typeNames={typeNames} {...props} />}
      <div className="Assessment">
        <ContentDisplay display={display} loadContentDispatch={getGitHubOctokitInstance} />
      </div>
    </div>
  );
};

/**
 * Retrieves list of organizations for the authenticated user.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param setOrgList The React setter function for an array of organization names
 */
async function retrieveOrganizationList(octokit: Octokit, setOrgList: (orgs: string[]) => void) {
  const orgList: string[] = [];
  const results = (await octokit.orgs.listForAuthenticatedUser({ per_page: 100 })).data;
  const orgs = results.filter(org => org.login.includes('githubclassroom')); // filter only organisations with 'githubclassroom' in name
  orgs.forEach(org => {
    orgList.push(org.login);
  });
  setOrgList(orgList);
}

/**
 * Retrieves BrowsableMissions information from a mission repositories and sets them in the page's state.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param setBrowsableMissions The React setter function for an array of BrowsableMissions
 * @param setDisplay The React setter function for the page's display
 */
async function retrieveBrowsableMissions(
  octokit: Octokit,
  setDisplay: (display: JSX.Element) => void,
  selectedOrg: string,
  setBrowsableMissions: (browsableMissions: BrowsableMission[]) => void
) {
  setDisplay(
    <NonIdealState description="Loading Missions" icon={<Spinner size={SpinnerSize.LARGE} />} />
  );

  type ListForAuthenticatedUserData = GetResponseDataTypeFromEndpointMethod<
    typeof octokit.repos.listForAuthenticatedUser
  >;
  const allRepos: ListForAuthenticatedUserData = (
    await octokit.repos.listForAuthenticatedUser({ per_page: 100 })
  ).data;

  let orgRepos = allRepos;
  if (selectedOrg !== '') {
    orgRepos = allRepos.filter((repo: any) => repo.owner.login === selectedOrg);
  }

  const missionRepos = orgRepos.filter((repo: any) => repo.name.startsWith('sa-'));

  const getContentPromises = missionRepos.map(repo => {
    const login = (repo.owner as any).login;
    const repoName = repo.name;
    const createdAt = repo.created_at;

    const promiseCreator = async () => {
      const getContentResponse = await octokit.repos.getContent({
        owner: login,
        repo: repo.name,
        path: ''
      });

      return {
        getContentResponse: getContentResponse,
        login: login,
        repoName: repoName,
        createdAt: createdAt
      };
    };

    return promiseCreator();
  });

  const foundMissionRepos: MissionRepoData[] = [];
  let browsableMissions: BrowsableMission[] = [];

  let unreachableCodeReached = false;

  Promise.all(getContentPromises).then((promisedContents: any[]) => {
    promisedContents.forEach((promisedContent: any) => {
      type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
      type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;

      const getContentResponse: GetContentResponse = promisedContent.getContentResponse;
      const files: GetContentData = getContentResponse.data;
      const login: string = promisedContent.login;
      const repoName: string = promisedContent.repoName;
      const createdAt: string = promisedContent.createdAt;

      if (!Array.isArray(files)) {
        // Code should not reach this point
        unreachableCodeReached = true;
        return;
      }

      const githubSubDirectories = files as any[];

      let repositoryContainsMetadataFile = false;
      for (let j = 0; j < githubSubDirectories.length; j++) {
        const file = githubSubDirectories[j];
        if (file.name === '.metadata') {
          repositoryContainsMetadataFile = true;
          break;
        }
      }

      if (repositoryContainsMetadataFile) {
        const missionRepoData: MissionRepoData = {
          repoOwner: login,
          repoName: repoName,
          dateOfCreation: new Date(createdAt)
        };
        foundMissionRepos.push(missionRepoData);
      }
    });

    if (unreachableCodeReached) {
      return;
    }

    const missionPromises = foundMissionRepos.map(missionRepoData =>
      convertRepoToBrowsableMission(missionRepoData, octokit)
    );

    Promise.all(missionPromises).then((acceptedMissions: BrowsableMission[]) => {
      browsableMissions = acceptedMissions;
    });
  });

  const unacceptedMissions: BrowsableMission[] = await retrieveUnacceptedMissions(
    octokit,
    orgRepos
  );

  browsableMissions = browsableMissions.concat(unacceptedMissions);
  browsableMissions.sort((a, b) => {
    return a.missionRepoData.dateOfCreation < b.missionRepoData.dateOfCreation ? 1 : -1;
  });

  setBrowsableMissions(browsableMissions);

  if (unreachableCodeReached) {
    setDisplay(
      <NonIdealState
        title="Something went wrong when retrieving repository data."
        icon={IconNames.FLAME}
      />
    );
    return;
  }
}

/**
 * Retrieves Missions that are in course-info repos but have not been found in user repos.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param orgRepos The array of data from octokit retrieved about classroom owned repositories
 */
async function retrieveUnacceptedMissions(octokit: Octokit, orgRepos: any[]) {
  const userLogin = (await octokit.users.getAuthenticated()).data.login;
  const courseRepo = orgRepos.find(repo => repo.name.includes('course-info'));
  const unacceptedMissions: BrowsableMission[] = [];

  if (courseRepo === undefined) {
    showWarningMessage('This organisation is not a valid Source Academy Classroom.', 2000);
    return unacceptedMissions;
  }

  const files = (
    await octokit.repos.getContent({
      owner: courseRepo.owner.login,
      repo: courseRepo.name,
      path: ''
    })
  ).data;

  if (Array.isArray(files) && files.find(file => file.name === '.CourseInformation.json')) {
    const result = await octokit.repos.getContent({
      owner: courseRepo.owner.login,
      repo: courseRepo.name,
      path: '.CourseInformation.json'
    });

    const courseInformation = JSON.parse(
      Buffer.from((result.data as any).content, 'base64').toString()
    );

    courseInformation.types[0].assessments.forEach((mission: GitHubMission) => {
      const prefixLogin = mission.repoPrefix + '-' + userLogin;

      let foundMatch = false;
      for (let j = 0; j < orgRepos.length; ++j) {
        if (orgRepos[j].name.includes(prefixLogin)) {
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        unacceptedMissions.push({
          title: mission.title,
          coverImage: mission.coverImage,
          webSummary: mission.shortSummary,
          missionRepoData: {
            repoOwner: courseRepo.owner.login,
            repoName: mission.repoPrefix + '-' + userLogin,
            dateOfCreation: new Date()
          },
          dueDate: new Date(mission.closeAt),
          link: mission.acceptLink
        });
      }
    });
  }

  return unacceptedMissions;
}

type GitHubMission = {
  id: string;
  title: string;
  openAt: string;
  closeAt: string;
  published: string;
  coverImage: string;
  shortSummary: string;
  acceptLink: string;
  repoPrefix: string;
};

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
  link?: string;
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

  let buttonText = 'Open';
  if (missionRepo.link) {
    buttonText = 'Accept';
  } else {
    if (isOverdue) {
      buttonText = 'Review Answers';
    }
  }

  const data = missionRepo.missionRepoData;

  const handleClick = () => {
    if (missionRepo.link) {
      window.open(missionRepo.link);
    } else {
      history.push(`/githubassessments/editor`, data);
    }
  };

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

export default GitHubMissionListing;
