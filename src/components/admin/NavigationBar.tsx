import * as React from 'react'

import { Alignment, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import { NavLink } from 'react-router-dom'

const NavigationBar: React.SFC<{}> = () => (
  <Navbar className="NavigationBar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/admin/announcements"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon="feed" />
        Announcements
      </NavLink>
      <NavLink
        to="/admin/assessments"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon="tick" />
        Assessments
      </NavLink>
      <NavLink
        to="/admin/materials"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon="folder-open" />
        Materials
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
