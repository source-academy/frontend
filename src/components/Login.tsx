import { Button, ButtonGroup, Dialog } from '@blueprintjs/core'
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
    <Dialog
      icon={IconNames.LOCK}
      isOpen={true}
      title="LOGIN"
      isCloseButtonShown={false}
      className="login-dialog pt-dark"
    >
      <div className="pt-dialog-body">
        <ButtonGroup fill={true} vertical={true}>
          {loginButton(() => props.handleLogin())}
          {playgroundButton}
        </ButtonGroup>
      </div>
    </Dialog>
  </div>
)

export default Login
