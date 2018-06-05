import * as React from 'react'

import { Alignment, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { NavLink } from 'react-router-dom'

const NavigationBar: React.SFC<{}> = () => (
  <Navbar className="NavigationBar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/admin/announcements"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FEED} />
        Announcements
      </NavLink>
      <NavLink
        to="/admin/assessments"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.TICK} />
        Assessments
      </NavLink>
      <NavLink
        to="/admin/materials"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FOLDER_OPEN} />
        Materials
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
