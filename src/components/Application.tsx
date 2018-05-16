import * as React from 'react'

import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import DashboardContainer from '../containers/DashboardContainer'
import PlaygroundContainer from '../containers/PlaygroundContainer'
import NavigationBar from './NavigationBar'
import NotFound from './NotFound'

export interface IApplicationProps extends RouteComponentProps<{}> {
  title: string
}

const Application: React.SFC<IApplicationProps> = (props: IApplicationProps) => {
  const redirectToDashboard = () => <Redirect to="/dashboard" />

  return (
    <div className="Application">
      <NavigationBar title={props.title} />
      <div className="Application__main">
        <Switch>
          <Route path="/dashboard" component={DashboardContainer} />
          <Route path="/playground" component={PlaygroundContainer} />
          <Route exact={true} path="/" component={redirectToDashboard} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

export default Application
