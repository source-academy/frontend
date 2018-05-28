import * as React from 'react'

import LoginDialog from './Login'

import deviceBackground from '../assets/device_background.png'

export interface IDeviceProps {
  token?: string
}

const deviceStyle = {
  backgroundImage: `url(${deviceBackground})`
}

const Device: React.SFC<IDeviceProps> = props => {
  const login = props.token === undefined ? <LoginDialog /> : undefined
  return (
    <div className="Device" style={deviceStyle}>
      {login}
    </div>
  )
}

export default Device
