import {
  Callout,
  Drawer,
  Intent,
  NonIdealState,
  ProgressBar,
  Spinner
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { NavLink } from 'react-router-dom';
import { Role } from '../../reducers/states';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import { AssessmentCategories, AssessmentCategory, AssessmentStatuses, IAssessmentOverview } from '../assessment/assessmentShape';

type ProfileProps = DispatchProps & OwnProps & StateProps;

export type StateProps = {
  assessmentOverviews?: IAssessmentOverview[];
  name?: string;
  role?: Role;
};

export type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
};

class Profile extends React.Component<ProfileProps> {
  public componentDidMount() {
    if (!this.props.assessmentOverviews) {
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
      // Compute the user's current total grade and XP from submitted assessments
      const [currentGrade, currentXp, maxGrade, maxXp] = this.props.assessmentOverviews!.reduce(
        (acc, item) =>
          item.status === AssessmentStatuses.submitted
            ? [acc[0] + item.grade, acc[1] + item.xp, acc[2] + item.maxGrade, acc[3] + item.maxXp]
            : acc,
        [0, 0, 0, 0]
      );

      // Performs boundary checks if denominator is 0 or if it exceeds 1 (100%)
      const getFrac = (num: number, den: number): number => {
        return den <= 0 || num / den > 1
          ? 1
          : num / den;
      };

      // Given a fraction between 0 and 1 inclusive, returns the corresponding Intent (colour)
      const parseFrac = (frac: number): Intent => {
        return frac < 0
          ? Intent.NONE
          : frac >= 0.9
            ? Intent.PRIMARY
            : frac >= 0.8
              ? Intent.SUCCESS
              : frac >= 0.6
                ? Intent.WARNING
                : Intent.DANGER;
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
      const summaryCallouts = this.props.assessmentOverviews!
        .filter( (item) => item.status === AssessmentStatuses.submitted )
        .map( (item) => {
          return (
            // Make each card navigate the user to the respective assessment
            <NavLink
              className='profile-summary-navlink'
              key={`${item.title}-${item.id}`}
              target="_blank"
              to={`/academy/${assessmentCategoryLink(item.category)}/${item.id}/0`}
              activeClassName='profile-summary-navlink'
            >
              <Callout
                className='profile-summary-callout'
                key={`${item.title}-${item.id}`}
                icon={renderIcon(item.category)}
                title={item.title}
              >
              {item.maxGrade <= 0 && item.grade === 0 ? '' :
                <div className='grade-details'>
                  <div className='title'>Grade</div>
                  <div className='value'>{item.grade} / {item.maxGrade}</div>
                  <ProgressBar
                    animate={false}
                    className='value-bar'
                    intent={parseFrac(getFrac(item.grade, item.maxGrade))}
                    stripes={false}
                    value={getFrac(item.grade, item.maxGrade)} />
                </div>
              }
              {item.maxXp <= 0 && item.xp === 0 ? '' :
                <div className='xp-details'>
                  <div className='title'>XP</div>
                  <div className='value'>{item.xp} / {item.maxXp}</div>
                  <ProgressBar
                    animate={false}
                    className='value-bar'
                    intent={parseFrac(getFrac(item.xp, item.maxXp))}
                    stripes={false}
                    value={getFrac(item.xp, item.maxXp)} />
                </div>
              }
              </Callout>
            </NavLink>
          );
        });

      // Compute the user's maximum total grade and XP from submitted assessments
      content = (
        <div className='profile-content'>
          <div className="profile-header">
            <div className="profile-username">
              <div className="name">{this.props.name}</div>
              <div className="role">{this.props.role}</div>
            </div>
          </div>
          <div className="profile-progress">
            <div className="profile-grade">
              <Spinner
                className="grade-spinner"
                intent={parseFrac(getFrac(currentGrade, maxGrade))}
                size={144}
                value={getFrac(currentGrade, maxGrade)}
              />
              <div className="type">Grade</div>
              <div className="total-value">
                {currentGrade} / {maxGrade}
              </div>
              <div className="percentage">{(getFrac(currentGrade, maxGrade) * 100).toFixed(2)}%</div>
            </div>
            <div className="profile-xp">
              <Spinner
                className="xp-spinner"
                intent={parseFrac(getFrac(currentXp, maxXp))}
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
          <div className="profile-callouts">
              {summaryCallouts}
          </div>
        </div>
      );
    }

    return (
      <Drawer
        className='profile'
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
