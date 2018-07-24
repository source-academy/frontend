import { NavbarDivider, Popover, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import { Role } from '../../reducers/states'
import { controlButton } from '../commons'

type StatusProps = OwnProps

type OwnProps = {
  handleLogOut: () => void
  username: string
  role: Role
}

const Status: React.SFC<StatusProps> = props => (
  <>
    <div className="visible-xs">
      <NavbarDivider className="thin-divider" />
    </div>
    <div className="hidden-xs">
      <NavbarDivider className="default-divider" />
    </div>
    {StatusPopover(props)}
  </>
)

const StatusPopover = (props: StatusProps) => (
  <Popover popoverClassName="Popover-share pt-dark" inheritDarkTheme={true}>
    <div className="navbar-button-text hidden-xs">
      {controlButton(titleCase(props.username), IconNames.USER)}
    </div>
    <div className="Popover-status-content">
      <Text>
        <h4>{`Source Academy, ${titleCase(props.role)}`}</h4>
      </Text>
      {controlButton('', IconNames.LOG_OUT, props.handleLogOut)}
    </div>
  </Popover>
)

const titleCase = (str: string) =>
  str.replace(/\w\S*/g, wrd => wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase())

export default Status
