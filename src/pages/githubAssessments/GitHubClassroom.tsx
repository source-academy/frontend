import { NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import ContentDisplay from '../../commons/ContentDisplay';
import { MissionRepoData } from '../../commons/githubAssessments/GitHubMissionTypes';
import GitHubAssessmentsNavigationBar from '../../commons/navigationBar/subcomponents/GitHubAssessmentsNavigationBar';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { assessmentTypeLink } from '../../commons/utils/ParamParseHelper';
import GitHubAssessmentListing from './GitHubAssessmentListing';
import GitHubAssessmentWorkspaceContainer from './GitHubAssessmentWorkspaceContainer';
import GitHubClassroomWelcome from './GitHubClassroomWelcome';

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
    assessmentTypeOverviews: GHAssessmentTypeOverview[] | undefined;
    selectedCourse: string | undefined;
  }>();
  const octokit: Octokit | undefined = useTypedSelector(
    store => store.session.githubOctokitObject
  ).octokit;
  const [courses, setCourses] = useState<string[] | undefined>(location.state?.courses);
  const [selectedCourse, setSelectedCourse] = useState<string>(
    location.state?.selectedCourse || ''
  );
  const [assessmentTypeOverviews, setAssessmentTypeOverviews] = useState<
    GHAssessmentTypeOverview[] | undefined
  >(location.state?.assessmentTypeOverviews);
  const types = assessmentTypeOverviews?.map(overview => overview.typeName);

  useEffect(() => {
    if (octokit === undefined) {
      return;
    }

    if (!courses) {
      fetchCourses(octokit, setCourses, setSelectedCourse, setAssessmentTypeOverviews);
    }
  }, [courses, octokit]);

  const changeCourseHandler = React.useCallback(
    (e: any) => {
      if (octokit === undefined) {
        return;
      }

      fetchAssessmentOverviews(octokit, e.target.innerText, setAssessmentTypeOverviews);
      setSelectedCourse(e.target.innerText);
    },
    [octokit, setSelectedCourse, setAssessmentTypeOverviews]
  );

  const refreshAssessmentOverviews = () => {
    if (octokit === undefined) {
      return;
    }

    fetchAssessmentOverviews(octokit, selectedCourse, setAssessmentTypeOverviews);
  };

  const redirectToLogin = () => <Redirect to="/githubassessments/login" />;
  const redirectToAssessments = () => (
    <Redirect
      to={{
        // Types should exist whenever we redirect to assessments as this redirect is only called
        // when a course exists. Unless the course.json is configured wrongly.
        pathname: `/githubassessments/${assessmentTypeLink(types ? types[0] : 'welcome')}`,
        state: {
          courses: courses,
          assessmentTypeOverviews: assessmentTypeOverviews,
          selectedCourse: selectedCourse
        }
      }}
    />
  );

  return (
    <div className="Academy" style={{ overflow: 'hidden' }}>
      <GitHubAssessmentsNavigationBar
        changeCourseHandler={changeCourseHandler}
        handleGitHubLogIn={props.handleGitHubLogIn}
        handleGitHubLogOut={() => {
          props.handleGitHubLogOut();
          setCourses(undefined);
          setAssessmentTypeOverviews(undefined);
          setSelectedCourse('');
        }}
        octokit={octokit}
        courses={courses}
        selectedCourse={selectedCourse}
        types={types}
        assessmentTypeOverviews={assessmentTypeOverviews}
      />
      <Switch>
        <Route
          path="/githubassessments/login"
          render={() => {
            return octokit && (!courses || (courses.length > 0 && !assessmentTypeOverviews)) ? (
              <ContentDisplay
                display={<NonIdealState description="Loading..." icon={<Spinner />} />}
                loadContentDispatch={() => {}}
              />
            ) : octokit && courses && courses.length === 0 ? (
              <Redirect to="/githubassessments/welcome" />
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
            );
          }}
        />
        <Route
          path="/githubassessments/welcome"
          component={() => (octokit ? <GitHubClassroomWelcome /> : redirectToLogin())}
        />
        <Route path="/githubassessments/editor" component={GitHubAssessmentWorkspaceContainer} />
        {octokit
          ? types?.map((type, idx) => {
              const filteredAssessments = assessmentTypeOverviews
                ? assessmentTypeOverviews[idx].assessments
                : undefined;
              return (
                <Route
                  path={`/githubassessments/${assessmentTypeLink(type)}`}
                  render={() => (
                    <GitHubAssessmentListing
                      assessmentOverviews={filteredAssessments}
                      refreshAssessmentOverviews={refreshAssessmentOverviews}
                    />
                  )}
                  key={idx}
                />
              );
            })
          : null}
        <Route
          render={
            octokit && courses && courses.length > 0 ? redirectToAssessments : redirectToLogin
          }
        />
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
  setAssessmentTypeOverviews: (assessmentTypeOverviews: GHAssessmentTypeOverview[]) => void
) {
  const courses: string[] = [];
  const results = (await octokit.orgs.listForAuthenticatedUser({ per_page: 100 })).data;
  const orgs = results.filter(org => org.login.includes('source-academy-course')); // filter only organisations with 'source-academy-course' in name
  orgs.forEach(org => {
    courses.push(org.login.replace('source-academy-course-', ''));
  });
  setCourses(courses);
  if (courses.length > 0) {
    setSelectedCourse(courses[0]);
    fetchAssessmentOverviews(octokit, courses[0], setAssessmentTypeOverviews);
  }
}

export type GHAssessmentTypeOverview = {
  typeName: string;
  assessments: GHAssessmentOverview[];
};

export type GHAssessmentOverview = {
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
  setAssessmentTypeOverviews: (assessmentTypeOverviews: GHAssessmentTypeOverview[]) => void
) {
  const userLogin = (await octokit.users.getAuthenticated()).data.login;
  const orgLogin = 'source-academy-course-'.concat(selectedCourse);
  type ListForAuthenticatedUserData = GetResponseDataTypeFromEndpointMethod<
    typeof octokit.repos.listForAuthenticatedUser
  >;
  const userRepos: ListForAuthenticatedUserData = (
    await octokit.repos.listForAuthenticatedUser({ per_page: 100 })
  ).data;
  const courseRepos = userRepos.filter(repo => repo.owner!.login === orgLogin);
  const courseInfoRepo = courseRepos.find(repo => repo.name.includes('course-info'));

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

      courseInfo.types.forEach((type: { typeName: string; assessments: [GitHubAssessment] }) => {
        const assessmentOverviews: GHAssessmentOverview[] = [];
        type.assessments.forEach((assessment: GitHubAssessment) => {
          if (!assessment.published) {
            return;
          }

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

          assessmentOverviews.sort((a, b) => (a.dueDate <= b.dueDate ? -1 : 1));
        });
        (type as any).assessments = assessmentOverviews;
      });
      setAssessmentTypeOverviews(courseInfo.types);
    } else {
      showWarningMessage('The course-info.json file cannot be located.', 2000);
      return;
    }
  }
}

export default GitHubClassroom;
