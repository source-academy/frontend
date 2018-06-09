import { Card } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import AnnouncementManager from '../../containers/admin/AnnouncementManagerContainer'
import AssessmentManager from '../../containers/admin/AssessmentManagerContainer'
import AdminNavigationBar from './NavigationBar'

type AdminProps = StateProps

export type StateProps = {
  token?: string
}

const Admin: React.SFC<AdminProps> = props => (
  <div className="Admin">
    <AdminNavigationBar />
    <div className="row center-xs">
      <div className="col-xs-12 admin-content-parent">
        <Card className="admin-content" elevation={1}>
          <Switch>
            {checkLoggedIn(props)}
            <Route path="/admin/announcements" component={AnnouncementManager} />
            <Route path="/admin/assessments" component={AssessmentManager} />
            <Route exact={true} path="/admin" component={redirectToAnnouncements} />
            <Route component={redirectTo404} />
          </Switch>
        </Card>
      </div>
    </div>
  </div>
)

const checkLoggedIn = (props: AdminProps) =>
  props.token === undefined ? <Route component={redirectToLogin} /> : undefined

const redirectTo404 = () => <Redirect to="/404" />

const redirectToAnnouncements = () => <Redirect to="/admin/announcements" />

const redirectToLogin = () => <Redirect to="/login" />

export default Admin
