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
import MissionRepoData from '../../commons/githubAssessments/MissionRepoData';
import Markdown from '../../commons/Markdown';
import Constants from '../../commons/utils/Constants';
import { showSuccessMessage, showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';

/**
 * A page that lists the courses available to the authenticated user.
 * This page should only be reachable if using a GitHub-hosted deployment.
 */
const GitHubCourseListing: React.FC = () => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  const [browsableCourses, setBrowsableCourses] = useState<BrowsableCourse[]>([]);
  const [display, setDisplay] = useState<JSX.Element>(<></>);

  const octokit: Octokit = useSelector((store: any) => store.session.githubOctokitObject).octokit;

  const [values, setValues] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (octokit === undefined) {
      setDisplay(
        <NonIdealState description="Please sign in to GitHub." icon={IconNames.WARNING_SIGN} />
      );
    } else {
      retrieveCourses(octokit, setBrowsableCourses, setDisplay);
    }
  }, [octokit, setBrowsableCourses, setDisplay]);

  useEffect(() => {
    if (browsableCourses.length > 0) {
      const filteredCourses: BrowsableCourse[] = [];
      browsableCourses.forEach(course => {
        if (!filteredCourses.includes(course) && matchTag(course, values)) {
          filteredCourses.push(course);
        }
      });

      function matchTag(course: BrowsableCourse, tags: React.ReactNode[]) {
        let match = true;
        tags.forEach(tag => {
          if (tag !== null && tag !== undefined) {
            const name = course.name.toLowerCase();
            const description = course.description.toLowerCase();
            if (!(name + description).includes(tag.toString().toLowerCase())) {
              match = false;
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
          ? browsableCourses.map(element => convertCourseToCard(element, isMobileBreakpoint))
          : filteredCourses.map(element => convertCourseToCard(element, isMobileBreakpoint));

      setDisplay(
        <>
          {tagFilter}
          <Divider />
          {cards}
        </>
      );
    }
  }, [browsableCourses, isMobileBreakpoint, setDisplay, values]);

  return (
    <div className="Academy">
      <div className="Assessment">
        <ContentDisplay display={display} loadContentDispatch={getGitHubOctokitInstance} />
      </div>
    </div>
  );
};

type Mission = {
  name: string;
  link: string;
};

/**
 * Represents information about a GitHub repository containing a SourceAcademy Course.
 */
type BrowsableCourse = {
  name: string;
  description: string;
  facilitators: string[];
  missions: Mission[];
  courseRepoData: MissionRepoData;
};

/**
 * Retrieves BrowsableCourses information from a mission repositories and sets them in the page's state.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param setCourses The React setter function for an array of Courses
 * @param setDisplay The React setter function for the page's display
 */
async function retrieveCourses(
  octokit: Octokit,
  setCourses: (browsableCourses: BrowsableCourse[]) => void,
  setDisplay: (display: JSX.Element) => void
) {
  setDisplay(
    <NonIdealState description="Loading Courses" icon={<Spinner size={SpinnerSize.LARGE} />} />
  );

  const allRepos = (await octokit.repos.listForAuthenticatedUser({ per_page: 100 })).data;
  const correctlyNamedRepos = allRepos.filter((repo: any) => repo.name.startsWith('sa-'));

  const courses: BrowsableCourse[] = [];

  for (let i = 0; i < correctlyNamedRepos.length; i++) {
    const repo = correctlyNamedRepos[i] as any;
    const files = (
      await octokit.repos.getContent({
        owner: repo.owner.login,
        repo: repo.name,
        path: ''
      })
    ).data;

    if (Array.isArray(files)) {
      if (files.find(file => file.name === 'CourseInformation.json')) {
        const result = await octokit.repos.getContent({
          owner: repo.owner.login,
          repo: repo.name,
          path: 'CourseInformation.json'
        });

        const courseInformation = JSON.parse(
          Buffer.from((result.data as any).content, 'base64').toString()
        );

        const courseRepoData: MissionRepoData = {
          repoOwner: repo.owner.login,
          repoName: repo.name,
          dateOfCreation: new Date(repo.created_at)
        };

        try {
          courses.push({
            name: courseInformation.name,
            description: courseInformation.description,
            facilitators: courseInformation.facilitators,
            missions: courseInformation.missions,
            courseRepoData: courseRepoData
          });
        } catch (err) {
          showWarningMessage(repo.name + "'s CourseInformation.json appears to be corrupted.");
          continue;
        }
      }
    }
  }

  setCourses(courses);
}

/**
 * Maps from a BrowsableMission object to a JSX card that can be displayed on the Mission Listing.
 *
 * @param course An instance of a BrowsableCourse type to be converted
 * @param isMobileBreakpoint Whether we are using mobile breakpoint
 */
function convertCourseToCard(course: BrowsableCourse, isMobileBreakpoint: boolean) {
  const ratio = isMobileBreakpoint ? 5 : 3;
  const facilitators = 'Facilitators: ' + course.facilitators.join(', ');
  const dateOfCreation = course.courseRepoData.dateOfCreation.toDateString();

  let content = 'Missions: \n';
  course.missions.forEach(mission => {
    const line = mission.name.link(mission.link);
    content += '- ' + line + '\n';
  });

  const viewCourse = () => {
    showSuccessMessage('wew');
  };

  const buttonText = 'Open';

  return (
    <div key={course.name}>
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className={`col-xs-${String(ratio)} listing-picture`}>
          <img alt="Assessment" className={`cover-image-${course.name}`} src={defaultCoverImage} />
        </div>

        <div className={`col-xs-${String(12 - ratio)} listing-text`}>
          <div className="listing-header">
            <Text ellipsize={true}>
              <H4 className="listing-title">{course.name}</H4>
              <H6>{course.description}</H6>
              {facilitators}
            </Text>
          </div>

          <div className="listing-description">
            <Markdown content={content} />
          </div>

          <div className="listing-footer">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              {'Created on: ' + dateOfCreation}
            </Text>
            <div className="listing-button">
              <Button icon={IconNames.PLAY} minimal={true} onClick={viewCourse}>
                <span className="custom-hidden-xxxs">{buttonText}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default GitHubCourseListing;
