import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import Academy from '../containers/academy'
import Announcements from '../containers/AnnouncementsContainer'
import Login from '../containers/LoginContainer'
import Playground from '../containers/PlaygroundContainer'
import NavigationBar from './NavigationBar'
import NotFound from './NotFound'

export interface IApplicationProps extends RouteComponentProps<{}> {
  title: string
  ivleToken?: string
  username?: string
}

const Application: React.SFC<IApplicationProps> = props => {
  const redirectToNews = () => <Redirect to="/news" />
  const toAcademy = () => <Academy ivleToken={props.ivleToken} />

  return (
    <div className="Application">
      <NavigationBar title={props.title} username={props.username} />
      <div className="Application__main">
        <Switch>
          // tslint: disable-next-line
          <Route path="/academy" component={toAcademy} />
          <Route path="/news" component={Announcements} />
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
