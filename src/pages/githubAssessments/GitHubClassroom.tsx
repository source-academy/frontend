import { NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { OverallState } from '../../commons/application/ApplicationTypes';
import ContentDisplay from '../../commons/ContentDisplay';
import { MissionRepoData } from '../../commons/githubAssessments/GitHubMissionTypes';
import GitHubAssessmentsNavigationBar from '../../commons/navigationBar/subcomponents/GitHubAssessmentsNavigationBar';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import GitHubAssessmentListing from './GitHubAssessmentListing';
import GitHubAssessmentWorkspaceContainer from './GitHubAssessmentWorkspaceContainer';

type DispatchProps = {
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

/**
 * A page that lists the missions available to the authenticated user.
 * This page should only be reachable if using a GitHub-hosted deployment.
 */
const GitHubClassroom: React.FC<DispatchProps> = props => {
  const location = useLocation<{
    courses: string[] | undefined;
    types: string[] | undefined;
    assessmentOverviews: GHAssessmentOverview[] | undefined;
    selectedCourse: string | undefined;
  }>();
  const octokit: Octokit | undefined = useSelector(
    (store: OverallState) => store.session.githubOctokitObject
  ).octokit;
  const [courses, setCourses] = useState<string[] | undefined>(location.state?.courses);
  const [selectedCourse, setSelectedCourse] = useState<string>(
    location.state?.selectedCourse || ''
  );
  const [types, setTypes] = useState<string[]>(location.state?.types || []);
  const [assessmentOverviews, setAssessmentOverviews] = useState<
    GHAssessmentOverview[] | undefined
  >(location.state?.assessmentOverviews);

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

    setAssessmentOverviews(undefined);
    fetchAssessmentOverviews(octokit, selectedCourse, setTypes, setAssessmentOverviews);
  };

  const redirectToLogin = () => <Redirect to="/githubassessments/login" />;
  const redirectToAssessments = () => (
    <Redirect
      to={{
        pathname: `/githubassessments/${assessmentTypeLink(types[0])}`,
        state: {
          courses: courses,
          types: types,
          assessmentOverviews: assessmentOverviews,
          selectedCourse: selectedCourse
        }
      }}
    />
  );

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
        assessmentOverviews={assessmentOverviews}
      />
      <Switch>
        <Route
          path="/githubassessments/login"
          render={() =>
            octokit && (!courses || !assessmentOverviews) ? (
              <ContentDisplay
                display={<NonIdealState description="Loading..." icon={<Spinner />} />}
                loadContentDispatch={() => {}}
              />
            ) : octokit ? (
              redirectToAssessments()
            ) : (
              <ContentDisplay
                display={
                  <NonIdealState
                    description="Please sign in to GitHub."
                    icon={IconNames.WARNING_SIGN}
                  />
                }
                loadContentDispatch={() => {}}
              />
            )
          }
        />
        <Route
          path="/githubassessments/editor"
          component={GitHubAssessmentWorkspaceContainer}
        />
        {octokit
          ? types.map((type, idx) => {
              const filteredAssessments = assessmentOverviews?.filter(
                assessment => assessment.type === type
              );
              return (
                <Route
                  path={`/githubassessments/${assessmentTypeLink(type)}`}
                  render={() => (
                    <GitHubAssessmentListing assessmentOverviews={filteredAssessments} />
                  )}
                  key={idx}
                />
              );
            })
          : null}
        <Route render={redirectToLogin} />
      </Switch>
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
