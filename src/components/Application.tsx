import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import AdminContainer from '../containers/admin'
import Device from '../containers/device'
import Game from '../containers/GameContainer'
import NavigationBar from './NavigationBar'
import NotFound from './NotFound'
import Playground from './Playground'

export interface IApplicationProps extends RouteComponentProps<{}> {
  title: string
}

const Application: React.SFC<IApplicationProps> = props => {
  const redirectToGame = () => <Redirect to="/game" />

  return (
    <div className="Application">
      <NavigationBar title={props.title} />
      <div className="Application__main">
        <Switch>
          <Route path="/device" component={Device} />
          <Route path="/admin" component={AdminContainer} />
          <Route path="/playground" component={Playground} />
          <Route path="/game" component={Game} />
          <Route exact={true} path="/" component={redirectToGame} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

export default Application
