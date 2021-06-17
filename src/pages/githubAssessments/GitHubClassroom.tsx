import {
  Button,
  Card,
  Elevation,
  H4,
  H6,
  Icon,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Text
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { useLocation, useParams } from 'react-router-dom';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import { OverallState } from '../../commons/application/ApplicationTypes';
import ContentDisplay from '../../commons/ContentDisplay';
import controlButton from '../../commons/ControlButton';
import { MissionRepoData } from '../../commons/githubAssessments/GitHubMissionTypes';
import Markdown from '../../commons/Markdown';
import GitHubAssessmentsNavigationBar from '../../commons/navigationBar/subcomponents/GitHubAssessmentsNavigationBar';
import Constants from '../../commons/utils/Constants';
import { history } from '../../commons/utils/HistoryHelper';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';

type DispatchProps = {
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

/**
 * A page that lists the missions available to the authenticated user.
 * This page should only be reachable if using a GitHub-hosted deployment.
 */
const GitHubClassroom: React.FC<DispatchProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const octokit: Octokit | undefined = useSelector(
    (store: OverallState) => store.session.githubOctokitObject
  ).octokit;

  const locationState = useLocation().state as string;
  const { selectedType } = useParams<{ selectedType: string }>();

  const [display, setDisplay] = useState<JSX.Element>(<></>);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(
    locationState === undefined ? '' : locationState
  );
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [browsableMissions, setBrowsableMissions] = useState<BrowsableMission[]>([]);

  const createMissionButton = useMemo(
    () => (
      <Button icon={IconNames.ADD} onClick={() => history.push(`/githubassessments/editor`)}>
        Create a New Assignment!
      </Button>
    ),
    []
  );

  // GET user organisations after logging in
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
      setBrowsableMissions([]);
      setCourses([]);
      setSelectedCourse('');
      setTypeNames([]);
      return;
    }

    retrieveOrganizationList(octokit, setCourses, setSelectedCourse);
  }, [isMobileBreakpoint, octokit, props.handleGitHubLogIn]);

  // GET missions after selecting a course
  useEffect(() => {
    if (octokit === undefined) {
      return;
    }

    if (selectedCourse !== '') {
      setDisplay(
        <NonIdealState description="Loading Missions" icon={<Spinner size={SpinnerSize.LARGE} />} />
      );
      retrieveBrowsableMissions(
        octokit,
        selectedCourse,
        selectedType,
        setBrowsableMissions,
        setTypeNames
      );
    }
  }, [octokit, selectedCourse, selectedType]);

  // After missions retrieved, display mission listing
  useEffect(() => {
    if (octokit === undefined) {
      return;
    }

    if (browsableMissions.length === 0) {
      setDisplay(
        <>
          {createMissionButton}
          <NonIdealState description="No repositories found!" icon={IconNames.STAR_EMPTY} />
          {isMobileBreakpoint &&
            controlButton('Log Out', IconNames.GIT_BRANCH, props.handleGitHubLogOut, {
              intent: 'primary',
              minimal: false
            })}
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
        {createMissionButton}
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
    createMissionButton,
    isMobileBreakpoint,
    octokit,
    props.handleGitHubLogOut
  ]);

  return (
    <div className="Academy">
      <GitHubAssessmentsNavigationBar
        {...props}
        octokit={octokit}
        courses={courses}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        typeNames={typeNames}
      />
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
async function retrieveOrganizationList(octokit: Octokit, setCourses: (courses: string[]) => void, setSelectedCourse: (course: string) => void) {
  const orgList: string[] = [];
  const results = (await octokit.orgs.listForAuthenticatedUser({ per_page: 100 })).data;
  const orgs = results.filter(org => org.login.includes('source-academy-course')); // filter only organisations with 'source-academy-course' in name
  orgs.forEach(org => {
    orgList.push(org.login);
  });
  setCourses(orgList);
  if (orgList.length > 0) {
    setSelectedCourse(orgList[0]);
  }
}

type BrowsableMission = {
  title: string;
  coverImage: string;
  webSummary: string;
  missionRepoData: MissionRepoData;
  dueDate: Date;
  link?: string;
};

type GitHubAssessment = {
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

/**
 * Retrieves BrowsableMissions information from a mission repositories and sets them in the page's state.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param selectedCourse The course that the user has selected to browse
 * @param setBrowsableMissions The React setter function for an array of BrowsableMissions
 * @param setTypeNames The header names for the white navigation bar
 */
async function retrieveBrowsableMissions(
  octokit: Octokit,
  selectedCourse: string,
  selectedType: string,
  setBrowsableMissions: (browsableMissions: BrowsableMission[]) => void,
  setTypeNames: (typeNames: string[]) => void
) {
  const userLogin = (await octokit.users.getAuthenticated()).data.login;
  type ListForAuthenticatedUserData = GetResponseDataTypeFromEndpointMethod<
    typeof octokit.repos.listForAuthenticatedUser
  >;
  const userRepos: ListForAuthenticatedUserData = (
    await octokit.repos.listForAuthenticatedUser({ per_page: 100 })
  ).data;
  const courseRepos = userRepos.filter(repo => repo.owner!.login === selectedCourse);
  const courseInfoRepo = courseRepos.find(repo => repo.name.includes('course-info'));

  const browsableMissions: BrowsableMission[] = [];

  if (courseInfoRepo === undefined) {
    showWarningMessage('The course-info repository cannot be located.', 2000);
    return;
  }

  const files = (
    await octokit.repos.getContent({
      owner: courseInfoRepo.owner!.login,
      repo: courseInfoRepo.name,
      path: ''
    })
  ).data;

  if (Array.isArray(files)) {
    if (files.find(file => file.name === 'course-info.json')) {
      const result = await octokit.repos.getContent({
        owner: courseInfoRepo.owner!.login,
        repo: courseInfoRepo.name,
        path: 'course-info.json'
      });

      const courseInfo = JSON.parse(Buffer.from((result.data as any).content, 'base64').toString());

      const typeNames: string[] = [];
      courseInfo.types.forEach((type: { typeName: any; assessments: any }) => {
        typeNames.push(type.typeName);
      });
      setTypeNames(typeNames);

      courseInfo.types.forEach((type: { typeName: string; assessments: [GitHubAssessment] }) => {
        if (selectedType === undefined || selectedType === type.typeName) {
          type.assessments.forEach((assessment: GitHubAssessment) => {
            const prefixLogin = assessment.repoPrefix + '-' + userLogin;
            const missionRepo = userRepos.find(repo => repo.name === prefixLogin);

            let createdAt = new Date();
            let acceptLink = undefined;
            if (missionRepo === undefined) {
              acceptLink = assessment.acceptLink;
            } else {
              if (missionRepo.created_at !== null) {
                createdAt = new Date(missionRepo.created_at);
              }
            }

            browsableMissions.push({
              title: assessment.title,
              coverImage: assessment.coverImage,
              webSummary: assessment.shortSummary,
              missionRepoData: {
                repoOwner: courseInfoRepo.owner!.login,
                repoName: prefixLogin,
                dateOfCreation: createdAt
              },
              dueDate: new Date(assessment.closeAt),
              link: acceptLink
            });
          });
        }
      });
    } else {
      showWarningMessage('The course-info.json file cannot be located.', 2000);
      return;
    }
  }

  setBrowsableMissions(browsableMissions);
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

export default GitHubClassroom;
