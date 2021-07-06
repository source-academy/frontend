import { Drawer, DrawerSize, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { Role } from '../application/ApplicationTypes';
import {
  AssessmentOverview,
  AssessmentStatuses,
  AssessmentType,
  GradingStatuses
} from '../assessment/AssessmentTypes';
import ProfileCard from './ProfileCard';

type ProfileProps = DispatchProps & StateProps & OwnProps;

export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
};

export type StateProps = {
  name?: string;
  role?: Role;
  assessmentOverviews?: AssessmentOverview[];
  assessmentTypes?: AssessmentType[];
};

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
};

class Profile extends React.Component<ProfileProps, {}> {
  public componentDidMount() {
    if (this.props.name && this.props.role && !this.props.assessmentOverviews) {
      // If assessment overviews are not loaded, fetch them
      this.props.handleAssessmentOverviewFetch();
    }
  }

  public render() {
    const isLoaded = this.props.name && this.props.role && this.props.assessmentOverviews;
    let content: JSX.Element;

    if (!isLoaded) {
      content = <NonIdealState description="Loading..." icon={<Spinner />} />;
    } else {
      // Check if there are any closed assessments, else render a placeholder <div>
      const numClosed = this.props.assessmentOverviews!.filter(
        item => item.status === AssessmentStatuses.submitted
      ).length;

      const userDetails = (
        <div className="profile-header">
          <div className="profile-username">
            <div className="name">{this.props.name}</div>
            <div className="role">{this.props.role}</div>
          </div>
        </div>
      );

      if (numClosed === 0) {
        content = (
          <div className="profile-content">
            {userDetails}
            <div className="profile-placeholder">
              There are no closed assessments to render grade and XP of.
            </div>
          </div>
        );
      } else {
        // Compute the user's current total XP from submitted and graded assessments, and submitted and not manually graded assessments
        const [currentXp, maxXp] = this.props.assessmentOverviews!.reduce(
          (acc, item) =>
            item.status === AssessmentStatuses.submitted &&
            (item.gradingStatus === GradingStatuses.graded ||
              item.gradingStatus === GradingStatuses.excluded)
              ? [acc[0] + item.xp, acc[1] + item.maxXp]
              : acc,
          [0, 0]
        );

        // Performs boundary checks if denominator is 0 or if it exceeds 1 (100%)
        const getFrac = (num: number, den: number): number => {
          return den <= 0 || num / den > 1 ? 1 : num / den;
        };

        // Given a fraction between 0 and 1 inclusive, returns a className to apply colour with CSS
        const parseColour = (frac: number): string => {
          return frac < 0
            ? ''
            : frac >= 0.8
            ? ' progress-steelblue'
            : frac >= 0.45
            ? ' progress-deepskyblue'
            : ' progress-skyblue';
        };

        // Given an assessment category, return its icon
        const renderIcon = (assessmentType: AssessmentType) => {
          const icons: IconName[] = [
            IconNames.FLAME,
            IconNames.LIGHTBULB,
            IconNames.PREDICTIVE_ANALYSIS,
            IconNames.COMPARISON,
            IconNames.MANUAL
          ];
          if (this.props.assessmentTypes) {
            const index = this.props.assessmentTypes.indexOf(assessmentType);

            // For rendering hidden assessments not visible to the student
            // e.g. studio participation marks
            return index > 0 ? icons[index] : IconNames.PULSE;
          } else {
            // Should never hit this case as there are no assessments, submissions or answers
            // if there are no assessmentTypes
            return IconNames.PULSE;
          }
        };

        // Build condensed assessment cards from an array of assessments
        const summaryCallouts = this.props
          .assessmentOverviews!.filter(
            item =>
              item.status === AssessmentStatuses.submitted &&
              (item.gradingStatus === GradingStatuses.graded ||
                item.gradingStatus === GradingStatuses.excluded)
          )
          .map((assessment, index) => {
            return (
              <ProfileCard
                key={index}
                item={assessment}
                getFrac={getFrac}
                parseColour={parseColour}
                renderIcon={renderIcon}
              />
            );
          });

        // Compute the user's maximum total grade and XP from submitted assessments
        content = (
          <div className="profile-content">
            {userDetails}
            <div className="profile-progress">
              <div className="profile-xp">
                <Spinner
                  className={'profile-spinner' + parseColour(getFrac(currentXp, maxXp))}
                  size={144}
                  value={getFrac(currentXp, maxXp)}
                />
                <div className="type">XP</div>
                <div className="total-value">
                  {currentXp} / {maxXp}
                </div>
                <div className="percentage">{(getFrac(currentXp, maxXp) * 100).toFixed(2)}%</div>
              </div>
            </div>
            <div className="profile-callouts">{summaryCallouts}</div>
          </div>
        );
      }
    }

    return (
      <Drawer
        className="profile"
        icon={IconNames.USER}
        isCloseButtonShown={true}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        title="User Profile"
        position="left"
        size={DrawerSize.SMALL}
      >
        {content}
      </Drawer>
    );
  }
}

export default Profile;
