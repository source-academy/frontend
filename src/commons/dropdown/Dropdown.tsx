import { Menu, MenuItem, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import * as React from 'react';

import { UserCourse } from '../application/types/SessionTypes';
import controlButton from '../ControlButton';
import Profile from '../profile/ProfileContainer';
import DropdownAbout from './DropdownAbout';
import DropdownCourses from './DropdownCourses';
import DropdownHelp from './DropdownHelp';

type DropdownProps = DispatchProps & StateProps;

type DispatchProps = {
  handleLogOut: () => void;
  updateLatestViewedCourse: (courseId: number) => void;
};

type StateProps = {
  name?: string;
  courses: UserCourse[];
  courseId?: number;
};

type State = {
  isAboutOpen: boolean;
  isHelpOpen: boolean;
  isProfileOpen: boolean;
  isMyCoursesOpen: boolean;
};

class Dropdown extends React.Component<DropdownProps, State> {
  constructor(props: DropdownProps) {
    super(props);
    this.state = {
      isAboutOpen: false,
      isHelpOpen: false,
      isProfileOpen: false,
      isMyCoursesOpen: false
    };
  }

  public render() {
    return (
      <>
        <Popover2
          content={this.menu(this.props)}
          inheritDarkTheme={false}
          placement={Position.BOTTOM}
        >
          {controlButton('', IconNames.CARET_DOWN)}
        </Popover2>
        <DropdownAbout isOpen={this.state.isAboutOpen} onClose={this.toggleAboutOpen} />
        <DropdownHelp isOpen={this.state.isHelpOpen} onClose={this.toggleHelpOpen} />
        {this.props.name ? (
          <DropdownCourses
            isOpen={this.state.isMyCoursesOpen}
            onClose={this.toggleMyCoursesOpen}
            updateLatestViewedCourse={this.props.updateLatestViewedCourse}
            courses={this.props.courses}
            courseId={this.props.courseId}
          />
        ) : null}
        {this.props.name ? (
          <Profile isOpen={this.state.isProfileOpen} onClose={this.toggleProfileOpen} />
        ) : null}
      </>
    );
  }

  private menu(props: DropdownProps) {
    const profile = this.props.name ? (
      <MenuItem
        icon={IconNames.USER}
        onClick={this.toggleProfileOpen}
        text={titleCase(this.props.name)}
      />
    ) : null;

    const myCourses = this.props.name ? (
      <MenuItem icon={IconNames.PROPERTIES} onClick={this.toggleMyCoursesOpen} text="My Courses" />
    ) : null;

    const logout = this.props.name ? (
      <MenuItem icon={IconNames.LOG_OUT} text="Logout" onClick={this.props.handleLogOut} />
    ) : null;

    return (
      <Menu>
        {profile}
        {myCourses}
        <MenuItem icon={IconNames.HELP} onClick={this.toggleAboutOpen} text="About" />
        <MenuItem icon={IconNames.ERROR} onClick={this.toggleHelpOpen} text="Help" />
        {logout}
      </Menu>
    );
  }

  private toggleAboutOpen = () => {
    this.setState({ ...this.state, isAboutOpen: !this.state.isAboutOpen });
  };

  private toggleHelpOpen = () =>
    this.setState({ ...this.state, isHelpOpen: !this.state.isHelpOpen });

  private toggleProfileOpen = () =>
    this.setState({ ...this.state, isProfileOpen: !this.state.isProfileOpen });

  private toggleMyCoursesOpen = () =>
    this.setState({ ...this.state, isMyCoursesOpen: !this.state.isMyCoursesOpen });
}

const titleCase = (str: string) =>
  str.replace(/\w\S*/g, wrd => wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase());

export default Dropdown;
