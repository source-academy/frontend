import { Alignment, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

import { assessmentCategoryLink } from '../../utils/paramParseHelpers'
import { AssessmentCategories } from '../assessment/assessmentShape'

const NavigationBar: React.SFC<{}> = () => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Mission)}`}
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FLAME} />
        <div className="navbar-button-text hidden-xs">Missions</div>
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Sidequest)}`}
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.LIGHTBULB} />
        <div className="navbar-button-text hidden-xs">Sidequests</div>
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Path)}`}
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
        <div className="navbar-button-text hidden-xs">Paths</div>
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Contest)}`}
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.COMPARISON} />
        <div className="navbar-button-text hidden-xs">Contests</div>
      </NavLink>
    </NavbarGroup>
    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        to={`/academy/grading`}
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.ENDORSED} />
        <div className="navbar-button-text hidden-xs">Grading</div>
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
