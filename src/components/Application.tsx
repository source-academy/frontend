import * as React from 'react'

import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import DashboardContainer from '../containers/DashboardContainer'
import { IApplicationState } from '../reducers/application'
import NavigationBar from './NavigationBar'
import NotFound from './NotFound'

export interface IApplicationProps extends RouteComponentProps<{}> {
  application: IApplicationState
}

const Application: React.SFC<IApplicationProps> = ({ application }) => {
  const redirectToDashboard = () => <Redirect to="/dashboard" />

  return (
    <div className="Application">
      <NavigationBar title={application.title} />
      <div className="Application__main">
        <Switch>
          <Route path="/dashboard" component={DashboardContainer} />
          <Route exact={true} path="/" component={redirectToDashboard} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

export default Application
