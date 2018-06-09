import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import Announcements from '../containers/AnnouncementsContainer'
import Login from '../containers/LoginContainer'
import Academy from './academy'
import Admin from './admin'
import NavigationBar from './NavigationBar'
import NotFound from './NotFound'
import Playground from './Playground'

export interface IApplicationProps extends RouteComponentProps<{}> {
  title: string
  token?: string
  username?: string
}

const Application: React.SFC<IApplicationProps> = props => {
  const redirectToNews = () => <Redirect to="/news" />
  const toAcademy = () => <Academy token={props.token} />
  const toAdmin = () => <Admin token={props.token} />

  return (
    <div className="Application">
      <NavigationBar title={props.title} username={props.username} />
      <div className="Application__main">
        <Switch>
          // tslint: disable-next-line
          <Route path="/academy" component={toAcademy} />
          <Route path="/news" component={Announcements} />
          <Route path="/admin" component={toAdmin} />
          <Route path="/material" component={Announcements} />
          <Route path="/playground" component={Playground} />
          <Route path="/status" component={Announcements} />
          <Route path="/login" component={Login} />
          <Route exact={true} path="/" component={redirectToNews} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

export default Application
