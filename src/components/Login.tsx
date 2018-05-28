import { Button, ButtonGroup, Dialog } from '@blueprintjs/core'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

export interface ILoginProps {
  token?: string
}

const loginButton = (
  <Button className="pt-large" rightIcon="log-in">
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

const LoginDialog: React.SFC<ILoginProps> = props => (
  <div>
    <Dialog
      icon="lock"
      isOpen={props.token === undefined ? true : false}
      title="LOGIN"
      isCloseButtonShown={false}
      className="login pt-dark"
    >
      <div className="pt-dialog-body">
        <ButtonGroup fill={true} vertical={true}>
          {loginButton}
          {playgroundButton}
        </ButtonGroup>
      </div>
    </Dialog>
  </div>
)

export default LoginDialog
