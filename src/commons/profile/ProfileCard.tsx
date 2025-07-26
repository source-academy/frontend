import { Callout, ProgressBar } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';
import React from 'react';
import { NavLink } from 'react-router';

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

const ProfileCard: React.FC<ProfileCardProps> = props => {
  const { item } = props;

  const isInvalidXP = item.maxXp <= 0 && item.xp === 0;

  const xpDetails = (
    <div className="xp-details" data-testid="profile-xp-details">
      <div className="title" data-testid="profile-title">
        XP
      </div>
      <div className="value" data-testid="profile-value">
        {item.xp} / {item.maxXp}
      </div>
      <ProgressBar
        animate={false}
        className={'value-bar' + props.parseColour(props.getFrac(item.xp, item.maxXp))}
        stripes={false}
        value={props.getFrac(item.xp, item.maxXp)}
      />
    </div>
  );

  return (
    // Make each card navigate the user to the respective assessment
    <NavLink
      className="profile-summary-navlink"
      key={`${item.title}-${item.id}`}
      target="_blank"
      to={`/courses/${props.courseId}/${assessmentTypeLink(item.type)}/${item.id}/0`}
      data-testid="profile-summary-navlink"
    >
      <Callout
        className="profile-summary-callout"
        key={`${item.title}-${item.id}`}
        icon={props.renderIcon(item.type)}
        title={item.title}
        data-testid="profile-summary-callout"
      >
        {isInvalidXP ? '' : xpDetails}
      </Callout>
    </NavLink>
  );
};

export default ProfileCard;
