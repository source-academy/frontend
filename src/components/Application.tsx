import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import Academy from '../containers/academy'
import AdminContainer from '../containers/admin'
import Announcements from '../containers/AnnouncementsContainer'
import Login from '../containers/LoginContainer'
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

  return (
    <div className="Application">
      <NavigationBar title={props.title} username={props.username} />
      <div className="Application__main">
        <Switch>
          <Route path="/academy" component={Academy} />
          <Route path="/news" component={Announcements} />
          <Route path="/admin" component={AdminContainer} />
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
