import { Callout, ProgressBar } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import {
  AssessmentCategories,
  AssessmentCategory,
  IAssessmentOverview
} from '../assessment/AssessmentTypes';

interface IProfileCardProps extends IProfileCardDispatchProps, IProfileCardStateProps { }

interface IProfileCardStateProps {
  item: IAssessmentOverview;
}

interface IProfileCardDispatchProps {
  getFrac: (num: number, den: number) => number;
  parseColour: (frac: number) => string;
  renderIcon: (category: AssessmentCategory) => IconName;
}

class ProfileCard extends React.Component<IProfileCardProps, {}> {
  public render() {
    const { item } = this.props;
    
    const isInvalidMission = item.category !== AssessmentCategories.Mission ||
      (item.maxGrade <= 0 && item.grade === 0);
    const isInvalidXP = item.maxXp <= 0 && item.xp === 0;
    
    const missionDetail = (
      <div className="grade-details">
        <div className="title">Grade</div>
        <div className="value">
          {item.grade} / {item.maxGrade}
        </div>
        <ProgressBar
          animate={false}
          className={
            'value-bar' +
            this.props.parseColour(
              this.props.getFrac(item.grade, item.maxGrade)
            )
          }
          stripes={false}
          value={this.props.getFrac(item.grade, item.maxGrade)}
        />
      </div>);
    
    const xpDetails = (
      <div className="xp-details">
        <div className="title">XP</div>
        <div className="value">
          {item.xp} / {item.maxXp}
        </div>
        <ProgressBar
          animate={false}
          className={
            'value-bar' +
            this.props.parseColour(
              this.props.getFrac(item.xp, item.maxXp)
            )
          }
          stripes={false}
          value={this.props.getFrac(item.xp, item.maxXp)}
        />
      </div>);
    
    return (
      // Make each card navigate the user to the respective assessment
      <NavLink
        className="profile-summary-navlink"
        key={`${item.title}-${item.id}`}
        target="_blank"
        to={`/academy/${assessmentCategoryLink(item.category)}/${item.id}/0`}
        activeClassName="profile-summary-navlink"
      >
        <Callout
          className="profile-summary-callout"
          key={`${item.title}-${item.id}`}
          icon={this.props.renderIcon(item.category)}
          title={item.title}
        >
          { isInvalidMission ? '' : missionDetail }
          { isInvalidXP ? '' : xpDetails }
        </Callout>
      </NavLink>
    );
  }
}

export default ProfileCard;
