import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

import { controlButton } from '../commons/controlButton'

type DropdownProps = {
  handleLogOut: () => void
  username?: string
}

const dropdown = (props: DropdownProps) => (
  <Popover content={menu(props)} inheritDarkTheme={false} position={Position.BOTTOM}>
    {controlButton('', IconNames.CARET_DOWN)}
  </Popover>
)

const menu = (props: DropdownProps) => {
  const profile = props.username ? (
    <MenuItem icon={IconNames.USER} text={titleCase(props.username)} />
  ) : null
  const logout = props.username ? (
    <MenuItem icon={IconNames.LOG_OUT} text="Logout" onClick={props.handleLogOut} />
  ) : null
  return (
    <Menu>
      {profile}
      <MenuItem icon={IconNames.HELP} text="About" />
      <MenuItem icon={IconNames.ERROR} text="Help" />
      {logout}
    </Menu>
  )
}

const titleCase = (str: string) =>
  str.replace(/\w\S*/g, wrd => wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase())

export default dropdown
