import { Callout, ProgressBar } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';
import * as React from 'react';

import { NavLink } from 'react-router-dom';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import { AssessmentCategory, IAssessmentOverview } from '../assessment/assessmentShape';

type ProfileCardProps = {
  item: IAssessmentOverview;
  getFrac: (num: number, den: number) => number;
  parseColour: (frac: number) => string;
  renderIcon: (category: AssessmentCategory) => IconName;
};

class ProfileCard extends React.Component<ProfileCardProps, {}> {
  public render() {
    return (
      // Make each card navigate the user to the respective assessment
      <NavLink
        className="profile-summary-navlink"
        key={`${this.props.item.title}-${this.props.item.id}`}
        target="_blank"
        to={`/academy/${assessmentCategoryLink(this.props.item.category)}/${this.props.item.id}/0`}
        activeClassName="profile-summary-navlink"
      >
        <Callout
          className="profile-summary-callout"
          key={`${this.props.item.title}-${this.props.item.id}`}
          icon={this.props.renderIcon(this.props.item.category)}
          title={this.props.item.title}
        >
          {this.props.item.maxGrade <= 0 && this.props.item.grade === 0 ? (
            ''
          ) : (
            <div className="grade-details">
              <div className="title">Grade</div>
              <div className="value">
                {this.props.item.grade} / {this.props.item.maxGrade}
              </div>
              <ProgressBar
                animate={false}
                className={
                  'value-bar' +
                  this.props.parseColour(
                    this.props.getFrac(this.props.item.grade, this.props.item.maxGrade)
                  )
                }
                stripes={false}
                value={this.props.getFrac(this.props.item.grade, this.props.item.maxGrade)}
              />
            </div>
          )}
          {this.props.item.maxXp <= 0 && this.props.item.xp === 0 ? (
            ''
          ) : (
            <div className="xp-details">
              <div className="title">XP</div>
              <div className="value">
                {this.props.item.xp} / {this.props.item.maxXp}
              </div>
              <ProgressBar
                animate={false}
                className={
                  'value-bar' +
                  this.props.parseColour(
                    this.props.getFrac(this.props.item.xp, this.props.item.maxXp)
                  )
                }
                stripes={false}
                value={this.props.getFrac(this.props.item.xp, this.props.item.maxXp)}
              />
            </div>
          )}
        </Callout>
      </NavLink>
    );
  }
}

export default ProfileCard;
