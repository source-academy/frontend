import { Icon, NavbarDivider } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import { Role } from '../../reducers/states'

type StatusProps = OwnProps

type OwnProps = {
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
    <Icon icon={IconNames.USER} />
    <div className="navbar-button-text hidden-xs navbar-username">{titleCase(props.username)}</div>
  </>
)

const titleCase = (str: string) =>
  str.replace(/\w\S*/g, wrd => wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase())

export default Status
