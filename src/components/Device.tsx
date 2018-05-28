import * as React from 'react'

import deviceBackground from '../assets/device_background.png'

const deviceStyle = {
  backgroundImage: `url(${deviceBackground})`
}

const Device: React.SFC<{}> = () => (
  <div className="Device" style={deviceStyle}>
    <h2>Device</h2>
  </div>
)

export default Device
