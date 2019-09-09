import { Drawer, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { Role } from '../../reducers/states';
import {
  AssessmentCategories,
  AssessmentCategory,
  AssessmentStatuses,
  GradingStatuses,
  IAssessmentOverview
} from '../assessment/assessmentShape';
import ProfileCard from './ProfileCard';

type ProfileProps = DispatchProps & OwnProps & StateProps;

export type StateProps = {
  name?: string;
  role?: Role;
  assessmentOverviews?: IAssessmentOverview[];
};

export type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
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
        // Compute the user's current total grade and XP from submitted assessments
        const [currentGrade, currentXp, maxGrade, maxXp] = this.props.assessmentOverviews!.reduce(
          (acc, item) =>
            item.status === AssessmentStatuses.submitted
              ? item.category === AssessmentCategories.Mission &&
                item.gradingStatus === GradingStatuses.graded
                ? [
                    acc[0] + item.grade / item.maxGrade,
                    acc[1] + item.xp,
                    acc[2] + 1,
                    acc[3] + item.maxXp
                  ]
                : [acc[0], acc[1] + item.xp, acc[2], acc[3] + item.maxXp]
              : acc,
          [0, 0, 0, 0]
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
        const renderIcon = (category: AssessmentCategory) => {
          switch (category) {
            case AssessmentCategories.Mission:
              return IconNames.FLAME;
            case AssessmentCategories.Sidequest:
              return IconNames.LIGHTBULB;
            case AssessmentCategories.Path:
              return IconNames.PREDICTIVE_ANALYSIS;
            case AssessmentCategories.Contest:
              return IconNames.COMPARISON;
            default:
              // For rendering hidden assessments not visible to the student
              // e.g. studio participation marks
              return IconNames.PULSE;
          }
        };

        // Build condensed assessment cards from an array of assessments
        const summaryCallouts = this.props
          .assessmentOverviews!.filter(item => item.status === AssessmentStatuses.submitted)
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
              <div className="profile-grade">
                <Spinner
                  className={'profile-spinner' + parseColour(getFrac(currentGrade, maxGrade))}
                  size={144}
                  value={getFrac(currentGrade, maxGrade)}
                />
                <div className="type">Grade</div>
                <div className="total-value">
                  {currentGrade.toFixed(2)} / {maxGrade.toFixed(2)}
                </div>
                <div className="percentage">
                  {(getFrac(currentGrade, maxGrade) * 100).toFixed(2)}%
                </div>
              </div>
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
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        icon={IconNames.USER}
        isCloseButtonShown={true}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        title="User Profile"
        position="left"
        size={'30%'}
      >
        {content}
      </Drawer>
    );
  }
}

export default Profile;
