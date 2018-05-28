import * as React from 'react'

import LoginDialog from './Login'

import deviceBackground from '../assets/device_background.png'

const deviceStyle = {
  backgroundImage: `url(${deviceBackground})`
}

const Device: React.SFC<{}> = () => (
  <div className="Device" style={deviceStyle}>
    <LoginDialog />
  </div>
)

export default Device
