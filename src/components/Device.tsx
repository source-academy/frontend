import * as React from 'react'

import LoginContainer from '../containers/LoginContainer'

import deviceBackground from '../assets/device_background.png'

const deviceStyle = {
  backgroundImage: `url(${deviceBackground})`
}

const Device: React.SFC<{}> = () => (
  <div className="Device" style={deviceStyle}>
    <LoginContainer />
  </div>
)

export default Device
