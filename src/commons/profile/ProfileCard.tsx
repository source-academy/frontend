import { Callout, ProgressBar } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import { NavLink } from 'react-router';

import type { AssessmentOverview, AssessmentType } from '../assessment/AssessmentTypes';
import { assessmentTypeLink } from '../utils/ParamParseHelper';

type Props = {
  item: AssessmentOverview;
  courseId?: number;
  getFrac: (num: number, den: number) => number;
  parseColour: (frac: number) => string;
  renderIcon: (category: AssessmentType) => IconName;
};

function ProfileCard(props: Props) {
  const { item } = props;

  const isInvalidXP = item.maxXp <= 0 && item.xp === 0;

  const xpDetails = (
    <div className="xp-details [&>*]:inline-block" data-testid="profile-xp-details">
      <div className="title w-[12%] text-left" data-testid="profile-title">
        XP
      </div>
      <div className="value w-[35%] text-center" data-testid="profile-value">
        {item.xp} / {item.maxXp}
      </div>
      <ProgressBar
        animate={false}
        className={'value-bar w-[53%]' + props.parseColour(props.getFrac(item.xp, item.maxXp))}
        stripes={false}
        value={props.getFrac(item.xp, item.maxXp)}
      />
    </div>
  );

  return (
    // Make each card navigate the user to the respective assessment
    <NavLink
      className="profile-summary-navlink text-black no-underline"
      key={`${item.title}-${item.id}`}
      target="_blank"
      to={`/courses/${props.courseId}/${assessmentTypeLink(item.type)}/${item.id}/0`}
      data-testid="profile-summary-navlink"
    >
      <Callout
        className="profile-summary-callout leading-none py-1 px-3 pl-7.5 rounded-md hover:bg-[rgba(138,155,168,0.25)] [&>div:not(:first-of-type)]:mt-[0.2em]"
        key={`${item.title}-${item.id}`}
        icon={props.renderIcon(item.type)}
        title={item.title}
        data-testid="profile-summary-callout"
      >
        {isInvalidXP ? '' : xpDetails}
      </Callout>
    </NavLink>
  );
}

export default ProfileCard;
