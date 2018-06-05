import { Card } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import AnnouncementManager from '../../containers/admin/AnnouncementManagerContainer'
import LoginContainer from '../../containers/LoginContainer'
import AdminNavigationBar from './NavigationBar'

const redirectToAnnouncements = () => <Redirect to="/admin/announcements" />

const Admin: React.SFC<{}> = () => {
  const redirectTo404 = () => <Redirect to="/404" />

  return (
    <div className="Admin">
      <LoginContainer />
      <AdminNavigationBar />
      <div className="row center-xs">
        <div className="col-xs-12 admin-content-parent">
          <Card className="admin-content" elevation={1}>
            <Switch>
              <Route path="/admin/announcements" component={AnnouncementManager} />
              <Route exact={true} path="/admin" component={redirectToAnnouncements} />
              <Route component={redirectTo404} />
            </Switch>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Admin
