import { Button, ButtonGroup, Card, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

type LoginProps = DispatchProps

export type DispatchProps = {
  handleLogin: () => void
}

const loginButton = (handleClick: () => void) => (
  <Button className="pt-large" rightIcon="log-in" onClick={handleClick}>
    Log in with IVLE
  </Button>
)

const playgroundButton = (
  <NavLink to="/playground">
    <Button className="pt-large" rightIcon="code">
      Try out the playground
    </Button>
  </NavLink>
)

const Login: React.SFC<LoginProps> = props => (
  <div className="Login pt-dark">
    <Card className="login-card pt-elevation-4">
      <div className="login-header">
        <h4>
          <Icon icon={IconNames.LOCK} />LOGIN
        </h4>
      </div>
      <div className="login-body">
        <ButtonGroup fill={true} vertical={true}>
          {loginButton(() => props.handleLogin())}
          {playgroundButton}
        </ButtonGroup>
      </div>
    </Card>
  </div>
)

export default Login
