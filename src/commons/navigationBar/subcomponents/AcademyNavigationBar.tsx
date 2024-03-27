import { Alignment, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import React from 'react';
import { AssessmentType } from 'src/commons/assessment/AssessmentTypes';
import { useSession } from 'src/commons/utils/Hooks';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { Role } from '../../application/ApplicationTypes';
import { createDesktopNavlink, NavbarEntryInfo, renderNavlinksFromInfo } from '../NavigationBar';

type Props = {
  assessmentTypes?: AssessmentType[];
};

const AcademyNavigationBar: React.FC<Props> = ({ assessmentTypes }) => {
  const { role, courseId } = useSession();
  const isEnrolledInACourse = !!role;

  const academyNavbarRightInfo = React.useMemo<NavbarEntryInfo[]>(
    () => getAcademyNavbarRightInfo({ isEnrolledInACourse, courseId, role }),
    [isEnrolledInACourse, courseId, role]
  );

  if (courseId === undefined || !isEnrolledInACourse) {
    return null;
  }

  return (
    <Navbar className="NavigationBar secondary-navbar">
      <NavbarGroup align={Alignment.LEFT}>
        {renderNavlinksFromInfo(
          assessmentTypesToNavlinkInfo({
            assessmentTypes,
            courseId,
            isEnrolledInACourse
          }),
          createDesktopNavlink
        )}
      </NavbarGroup>
      <NavbarGroup align={Alignment.RIGHT}>
        {renderNavlinksFromInfo(academyNavbarRightInfo, createDesktopNavlink)}
      </NavbarGroup>
    </Navbar>
  );
};

export const icons: IconName[] = [
  IconNames.FLAME,
  IconNames.LIGHTBULB,
  IconNames.PREDICTIVE_ANALYSIS,
  IconNames.COMPARISON,
  IconNames.MANUAL,
  IconNames.GRAPH,
  IconNames.FORM,
  IconNames.LAB_TEST,
  IconNames.CALCULATOR
];

export const assessmentTypesToNavlinkInfo = ({
  assessmentTypes = [],
  courseId,
  isEnrolledInACourse
}: {
  assessmentTypes?: string[];
  courseId?: number;
  isEnrolledInACourse: boolean;
}): NavbarEntryInfo[] =>
  assessmentTypes.map((assessmentType, idx) => ({
    to: `/courses/${courseId}/${assessmentTypeLink(assessmentType)}`,
    icon: icons[idx],
    text: assessmentType,
    disabled: !isEnrolledInACourse,
    hasNotifications: true,
    hiddenInBreakpoints: ['xs', 'sm']
  }));

const getStaffNavlinkInfo = ({
  courseId,
  role
}: {
  courseId?: number;
  role?: Role;
}): NavbarEntryInfo[] => {
  const isStaffOrAdmin = role === Role.Admin || role === Role.Staff;
  const isAdmin = role === Role.Admin;

  return [
    {
      to: `/courses/${courseId}/groundcontrol`,
      icon: IconNames.SATELLITE,
      text: 'Ground Control',
      disabled: !isStaffOrAdmin,
      hiddenInBreakpoints: ['xs', 'sm']
    },
    {
      to: `/courses/${courseId}/dashboard`,
      icon: IconNames.GLOBE,
      text: 'Dashboard',
      disabled: !isStaffOrAdmin,
      hiddenInBreakpoints: ['xs', 'sm']
    },
    {
      to: `/courses/${courseId}/sourcereel`,
      icon: IconNames.MOBILE_VIDEO,
      text: 'Sourcereel',
      disabled: !isStaffOrAdmin,
      hiddenInBreakpoints: ['xs', 'sm', 'md']
    },
    {
      to: `/courses/${courseId}/teamformation`,
      icon: IconNames.FORM,
      text: 'Team Formation',
      disabled: !isStaffOrAdmin,
      hiddenInBreakpoints: ['xs', 'sm', 'md']
    },
    {
      to: `/courses/${courseId}/grading`,
      icon: IconNames.ENDORSED,
      text: 'Grading',
      disabled: !isStaffOrAdmin,
      hasNotifications: true,
      hiddenInBreakpoints: ['xs', 'sm', 'md']
    },
    {
      to: `/courses/${courseId}/gamesimulator`,
      icon: IconNames.CROWN,
      text: 'Game Simulator',
      disabled: !isStaffOrAdmin,
      hiddenInBreakpoints: ['xs', 'sm', 'md']
    },
    {
      to: `/courses/${courseId}/adminpanel`,
      icon: IconNames.SETTINGS,
      text: 'Admin Panel',
      disabled: !isAdmin,
      hiddenInBreakpoints: ['xs', 'sm', 'md', 'lg']
    }
  ];
};

export const getAcademyNavbarRightInfo = ({
  isEnrolledInACourse,
  courseId,
  role
}: {
  isEnrolledInACourse: boolean;
  courseId?: number;
  role?: Role;
}): NavbarEntryInfo[] => [
  ...getStaffNavlinkInfo({ courseId, role }),
  {
    to: `/courses/${courseId}/notipreference`,
    icon: IconNames.NOTIFICATIONS,
    text: 'Notifications',
    disabled: !isEnrolledInACourse,
    hiddenInBreakpoints: ['xs', 'sm', 'md', 'lg']
  }
];

export default AcademyNavigationBar;
