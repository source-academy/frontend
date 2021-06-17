import { NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import { OverallState } from '../../commons/application/ApplicationTypes';
import ContentDisplay from '../../commons/ContentDisplay';
import { MissionRepoData } from '../../commons/githubAssessments/GitHubMissionTypes';
import GitHubAssessmentsNavigationBar from '../../commons/navigationBar/subcomponents/GitHubAssessmentsNavigationBar';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import GitHubAssessmentListing from './GitHubAssessmentListing';

type DispatchProps = {
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

/**
 * A page that lists the missions available to the authenticated user.
 * This page should only be reachable if using a GitHub-hosted deployment.
 */
const GitHubClassroom: React.FC<DispatchProps> = props => {
  const octokit: Octokit | undefined = useSelector(
    (store: OverallState) => store.session.githubOctokitObject
  ).octokit;
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [types, setTypes] = useState<string[]>([]);
  const [assessmentOverviews, setAssessmentOverviews] = useState<GHAssessmentOverview[] | null>(
    null
  );

  useEffect(() => {
    if (octokit === undefined) {
      return;
    }

    if (!courses) {
      fetchCourses(octokit, setCourses, setSelectedCourse, setTypes, setAssessmentOverviews);
    }
  }, [courses, octokit]);

  const changeCourseHandler = (e: any) => {
    setSelectedCourse(e.target.innerText);
    if (octokit === undefined) {
      return;
    }

    fetchAssessmentOverviews(octokit, selectedCourse, setTypes, setAssessmentOverviews);
  };

  return (
    <div className="Academy">
      <GitHubAssessmentsNavigationBar
        changeCourseHandler={changeCourseHandler}
        handleGitHubLogIn={props.handleGitHubLogIn}
        handleGitHubLogOut={props.handleGitHubLogOut}
        octokit={octokit}
        courses={courses}
        selectedCourse={selectedCourse}
        types={types}
      />
      {octokit === undefined ? (
        <div>
          <ContentDisplay
            display={
              <NonIdealState
                description="Please sign in to GitHub."
                icon={IconNames.WARNING_SIGN}
              />
            }
            loadContentDispatch={getGitHubOctokitInstance}
          />
        </div>
      ) : (
        <Switch>
          {types.map(type => {
            const filteredAssessments =
              assessmentOverviews === null
                ? null
                : assessmentOverviews.filter(assessment => {
                    return assessment.type === type;
                  });
            return (
              <Route
                path={`/githubassessments/${type}`}
                component={() => (
                  <GitHubAssessmentListing assessmentOverviews={filteredAssessments} />
                )}
              />
            );
          })}
          <Route component={() => <Redirect to="/githubassessments" />} />
        </Switch>
      )}
    </div>
  );
};

/**
 * Retrieves list of organizations for the authenticated user.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param setCourses The React setter function for an array of courses string names
 * @param setSelectedCourse The React setter function for string name of selected course
 */
async function fetchCourses(
  octokit: Octokit,
  setCourses: (courses: string[]) => void,
  setSelectedCourse: (course: string) => void,
  setTypes: (types: string[]) => void,
  setAssessmentOverviews: (assessmentOverviews: GHAssessmentOverview[]) => void
) {
  const orgList: string[] = [];
  const results = (await octokit.orgs.listForAuthenticatedUser({ per_page: 100 })).data;
  const orgs = results.filter(org => org.login.includes('source-academy-course')); // filter only organisations with 'source-academy-course' in name
  orgs.forEach(org => {
    orgList.push(org.login);
  });
  setCourses(orgList);
  if (orgList.length > 0) {
    setSelectedCourse(orgList[0]);
    fetchAssessmentOverviews(octokit, orgList[0], setTypes, setAssessmentOverviews);
  }
}

export type GHAssessmentOverview = {
  type: string;
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

async function fetchAssessmentOverviews(
  octokit: Octokit,
  selectedCourse: string,
  setTypes: (types: string[]) => void,
  setAssessmentOverviews: (assessmentOverviews: GHAssessmentOverview[]) => void
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

  const assessmentOverviews: GHAssessmentOverview[] = [];

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
      setTypes(typeNames);

      courseInfo.types.forEach((type: { typeName: string; assessments: [GitHubAssessment] }) => {
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

          assessmentOverviews.push({
            type: type.typeName,
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
      });
    } else {
      showWarningMessage('The course-info.json file cannot be located.', 2000);
      return;
    }
  }

  setAssessmentOverviews(assessmentOverviews);
}

export default GitHubClassroom;

/*
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
*/
