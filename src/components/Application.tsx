import * as React from 'react'

import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import DeviceContainer from '../containers/device'

import NavigationBar from './NavigationBar'
import NotFound from './NotFound'
import Playground from './Playground'

export interface IApplicationProps extends RouteComponentProps<{}> {
  title: string
}

const Application: React.SFC<IApplicationProps> = props => {
  const redirectToDevice = () => <Redirect to="/device" />

  return (
    <div className="Application">
      <NavigationBar title={props.title} />
      <div className="Application__main">
        <Switch>
          <Route path="/device" component={DeviceContainer} />
          <Route path="/playground" component={Playground} />
          <Route exact={true} path="/" component={redirectToDevice} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

export default Application
