import {
  Drawer,
  Intent,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { Role } from '../../reducers/states';
import { AssessmentStatuses, IAssessmentOverview } from '../assessment/assessmentShape';

type ProfileProps = OwnProps & StateProps;

export type StateProps = {
  assessmentOverviews?: IAssessmentOverview[];
  name?: string;
  role?: Role;
};

export type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
};

class Profile extends React.Component<ProfileProps> {
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
                intent={parseFrac(currentGrade / maxGrade)}
                size={144}
                value={currentGrade / maxGrade}
              />
              <div className="type">Grade</div>
              <div className="total-value">
                {currentGrade} / {maxGrade}
              </div>
              <div className="percentage">{((currentGrade / maxGrade) * 100).toFixed(2)}%</div>
            </div>
            <div className="profile-xp">
              <Spinner
                className="xp-spinner"
                intent={parseFrac(currentXp / maxXp)}
                size={144}
                value={currentXp / maxXp}
              />
              <div className="type">XP</div>
              <div className="total-value">
                {currentXp} / {maxXp}
              </div>
              <div className="percentage">{((currentXp / maxXp) * 100).toFixed(2)}%</div>
            </div>
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
