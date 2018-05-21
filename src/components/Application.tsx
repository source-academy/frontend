import * as React from 'react'

import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import DashboardContainer from '../containers/DashboardContainer'

import NavigationBar from './NavigationBar'
import NotFound from './NotFound'
import Playground from './Playground'

export interface IApplicationProps extends RouteComponentProps<{}> {
  title: string
}

const Application: React.SFC<IApplicationProps> = props => {
  const redirectToDashboard = () => <Redirect to="/dashboard" />

  return (
    <div className="Application pt-dark">
      <NavigationBar title={props.title} />
      <div className="Application__main">
        <Switch>
          <Route path="/dashboard" component={DashboardContainer} />
          <Route path="/playground" component={Playground} />
          <Route exact={true} path="/" component={redirectToDashboard} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

export default Application
