import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import AdminContainer from '../containers/admin'
import Announcements from '../containers/AnnouncementsContainer'
import Academy from '../containers/device'
import Game from '../containers/GameContainer'
import NavigationBar from './NavigationBar'
import NotFound from './NotFound'
import Playground from './Playground'

export interface IApplicationProps extends RouteComponentProps<{}> {
  title: string
  username?: string
}

const Application: React.SFC<IApplicationProps> = props => {
  const redirectToGame = () => <Redirect to="/game" />

  return (
    <div className="Application">
      <NavigationBar title={props.title} username={props.username} />
      <div className="Application__main">
        <Switch>
          <Route path="/academy" component={Academy} />
          <Route path="/announcements" component={Announcements} />
          <Route path="/admin" component={AdminContainer} />
          <Route path="/material" component={Announcements} />
          <Route path="/playground" component={Playground} />
          <Route path="/game" component={Game} />
          <Route path="/status" component={Announcements} />
          <Route exact={true} path="/" component={redirectToGame} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

export default Application
