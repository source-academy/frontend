import { Button, IButtonProps, IconName, Intent } from '@blueprintjs/core'
import * as React from 'react'

type controlButtonOptionals = {
  iconOnRight?: boolean
  intent?: Intent
  minimal?: boolean
}

const defaultOptions = {
  iconOnRight: false,
  intent: Intent.NONE,
  minimal: true
}

export function controlButton(
  label: string,
  icon: IconName,
  onClick = () => {},
  options: controlButtonOptionals = {}
) {
  const opts: controlButtonOptionals = { ...defaultOptions, ...options }
  const props: IButtonProps = { onClick }
  props.intent = opts.intent === undefined ? Intent.NONE : opts.intent
  props.className = opts.minimal ? 'pt-minimal' : undefined
  opts.iconOnRight ? (props.rightIcon = icon) : (props.icon = icon)
  return <Button {...props}>{label}</Button>
}
