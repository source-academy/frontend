import { Menu, MenuItem, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { logOut } from '../application/actions/CommonsActions';
import ControlButton from '../ControlButton';
import Profile from '../profile/Profile';
import { useSession } from '../utils/Hooks';
import DropdownAbout from './DropdownAbout';
import DropdownCourses from './DropdownCourses';
import DropdownCreateCourse from './DropdownCreateCourse';
import DropdownHelp from './DropdownHelp';
import DropdownSettings from './DropdownSettings';

const Dropdown: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMyCoursesOpen, setIsMyCoursesOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);

  const { isLoggedIn, name, courses, courseId } = useSession();
  const dispatch = useDispatch();
  const handleLogOut = () => dispatch(logOut());

  const toggleSettingsOpen = () => {
    setIsSettingsOpen(oldValue => !oldValue);
  };
  const toggleAboutOpen = () => {
    setIsAboutOpen(oldValue => !oldValue);
  };
  const toggleHelpOpen = () => setIsHelpOpen(oldValue => !oldValue);
  const toggleProfileOpen = () => setIsProfileOpen(oldValue => !oldValue);
  const toggleMyCoursesOpen = () => setIsMyCoursesOpen(oldValue => !oldValue);
  const toggleCreateCourseOpen = () => setIsCreateCourseOpen(oldValue => !oldValue);

  const profile =
    isLoggedIn && courseId != null ? (
      // Name is defined when user is logged in
      <MenuItem icon={IconNames.USER} onClick={toggleProfileOpen} text={titleCase(name!)} />
    ) : null;

  const myCourses = isLoggedIn ? (
    <MenuItem icon={IconNames.PROPERTIES} onClick={toggleMyCoursesOpen} text="My Courses" />
  ) : null;

  const createCourse = isLoggedIn ? (
    <MenuItem icon={IconNames.ADD} onClick={toggleCreateCourseOpen} text="Create Course" />
  ) : null;

  const logout = isLoggedIn ? (
    <MenuItem icon={IconNames.LOG_OUT} text="Logout" onClick={handleLogOut} />
  ) : null;

  const menu = (
    <Menu>
      {profile}
      {myCourses}
      {createCourse}
      <MenuItem icon={IconNames.COG} onClick={toggleSettingsOpen} text="Settings" />
      <MenuItem icon={IconNames.HELP} onClick={toggleAboutOpen} text="About" />
      <MenuItem icon={IconNames.ERROR} onClick={toggleHelpOpen} text="Help" />
      {logout}
    </Menu>
  );

  return (
    <>
      <Popover2 content={menu} inheritDarkTheme={false} placement={Position.BOTTOM}>
        <ControlButton icon={IconNames.CARET_DOWN} />
      </Popover2>
      <DropdownSettings isOpen={isSettingsOpen} onClose={toggleSettingsOpen} />
      <DropdownAbout isOpen={isAboutOpen} onClose={toggleAboutOpen} />
      <DropdownHelp isOpen={isHelpOpen} onClose={toggleHelpOpen} />
      {isLoggedIn ? (
        <>
          <DropdownCourses
            isOpen={isMyCoursesOpen}
            onClose={toggleMyCoursesOpen}
            courses={courses}
            courseId={courseId}
          />
          <DropdownCreateCourse isOpen={isCreateCourseOpen} onClose={toggleCreateCourseOpen} />
          <Profile isOpen={isProfileOpen} onClose={toggleProfileOpen} />
        </>
      ) : null}
    </>
  );
};

const titleCase = (str: string) =>
  str.replace(/\w\S*/g, wrd => wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase());

export default Dropdown;
