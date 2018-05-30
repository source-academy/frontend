import { Card, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { NavLink } from 'react-router-dom'
import JournalContainer from '../../containers/device/JournalContainer'
import LoginContainer from '../../containers/LoginContainer'
import NotFound from '../NotFound'

const redirectToJournal = () => <Redirect to="/device/journal" />

const Device: React.SFC<{}> = () => (
  <div className="Device">
    <LoginContainer />
    <Navbar className="NavigationBar pt-dark row">
      <NavbarGroup className="pt-align-left">
        <NavLink
          to="/device/inbox"
          activeClassName="pt-active"
          className="NavigationBar__link pt-button pt-minimal"
        >
          <Icon icon="inbox" />
          Inox
        </NavLink>
        <NavLink
          to="/device/journal"
          activeClassName="pt-active"
          className="NavigationBar__link pt-button pt-minimal"
        >
          <Icon icon="book" />
          Journal
        </NavLink>
        <NavLink
          to="/device/materials"
          activeClassName="pt-active"
          className="NavigationBar__link pt-button pt-minimal"
        >
          <Icon icon="folder-open" />
          Materials
        </NavLink>
        <NavLink
          to="/device/status"
          activeClassName="pt-active"
          className="NavigationBar__link pt-button pt-minimal"
        >
          <Icon icon="user" />
          Journal
        </NavLink>
      </NavbarGroup>
    </Navbar>
    <div className="row center-xs">
      <div className="col-xs-10 device-content-parent">
        <Card className="device-content" elevation={1}>
          <Switch>
            <Route path="/device/inbox" component={JournalContainer} />
            <Route path="/device/journal" component={JournalContainer} />
            <Route path="/device/materials" component={JournalContainer} />
            <Route path="/device/status" component={JournalContainer} />
            <Route exact={true} path="/device" component={redirectToJournal} />
            <Route component={NotFound} />
          </Switch>
        </Card>
      </div>
    </div>
  </div>
)

export default Device
