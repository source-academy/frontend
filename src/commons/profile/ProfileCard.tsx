import { Callout, ProgressBar } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { AssessmentOverview, AssessmentType } from '../assessment/AssessmentTypes';
import { assessmentTypeLink } from '../utils/ParamParseHelper';

type ProfileCardProps = DispatchProps & StateProps;

type StateProps = {
  item: AssessmentOverview;
  courseId?: number;
};

type DispatchProps = {
  getFrac: (num: number, den: number) => number;
  parseColour: (frac: number) => string;
  renderIcon: (category: AssessmentType) => IconName;
};

class ProfileCard extends React.Component<ProfileCardProps, {}> {
  public render() {
    const { item } = this.props;

    const isInvalidXP = item.maxXp <= 0 && item.xp === 0;

    const xpDetails = (
      <div className="xp-details">
        <div className="title">XP</div>
        <div className="value">
          {item.xp} / {item.maxXp}
        </div>
        <ProgressBar
          animate={false}
          className={'value-bar' + this.props.parseColour(this.props.getFrac(item.xp, item.maxXp))}
          stripes={false}
          value={this.props.getFrac(item.xp, item.maxXp)}
        />
      </div>
    );

    return (
      // Make each card navigate the user to the respective assessment
      <NavLink
        className="profile-summary-navlink"
        key={`${item.title}-${item.id}`}
        target="_blank"
        to={`/courses/${this.props.courseId}/${assessmentTypeLink(item.type)}/${item.id}/0`}
        activeClassName="profile-summary-navlink"
      >
        <Callout
          className="profile-summary-callout"
          key={`${item.title}-${item.id}`}
          icon={this.props.renderIcon(item.type)}
          title={item.title}
        >
          {isInvalidXP ? '' : xpDetails}
        </Callout>
      </NavLink>
    );
  }
}

export default ProfileCard;
