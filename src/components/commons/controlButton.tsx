import { Button, IconName, Intent } from '@blueprintjs/core'
import * as React from 'react'

export const controlButton = (
  label: string,
  icon: IconName,
  handleClick = () => {},
  intent = Intent.NONE,
  minimal = true
) => (
  <Button onClick={handleClick} className={minimal ? 'pt-minimal' : ''} intent={intent} icon={icon}>
    {label}
  </Button>
)
