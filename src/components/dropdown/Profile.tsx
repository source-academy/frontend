import { Classes, Dialog, NonIdealState, ProgressBar, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { Role } from '../../reducers/states';

type ProfileProps = OwnProps & StateProps;

export type StateProps = {
  grade: number;
  maxGrade: number;
  maxXp: number;
  name?: string;
  role?: Role;
  xp: number;
};

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
};

class Profile extends React.Component<ProfileProps> {
  public render() {
    const isLoaded = this.props.name && this.props.role;
    let content: JSX.Element;
    if (isLoaded) {
      content = (
        <>
          <div className="header">
            <div>
              <span className="name">{this.props.name}</span>
              <span className="role">{this.props.role}</span>
            </div>
          </div>
          <div className="progress">
            <div className="grade">
              <span className="label">Grade</span>
              <span className="value">{this.props.grade}</span>
            </div>
            <ProgressBar className="grade" animate={false} stripes={false} />
            <div className="xp">
              <span className="label">XP</span>
              <span className="value">{this.props.xp}</span>
            </div>
            <ProgressBar className="xp" animate={false} stripes={false} />
          </div>
        </>
      );
    } else {
      content = <NonIdealState description="Loading..." visual={<Spinner />} />;
    }
    return (
      <Dialog
        className="profile"
        icon={IconNames.USER}
        isCloseButtonShown={false}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        title="Profile"
      >
        <div className={Classes.DIALOG_BODY}>{content}</div>
      </Dialog>
    );
  }
}

export default Profile;
