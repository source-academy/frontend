import { Button, IButtonProps, IconName, Intent } from '@blueprintjs/core'
import * as React from 'react'

type controlButtonOptionals = {
  iconOnRight?: boolean
  intent?: Intent
  minimal?: boolean
  className?: string
}

const defaultOptions = {
  iconOnRight: false,
  intent: Intent.NONE,
  minimal: true,
  className: ''
}

export function controlButton(
  label: string,
  icon: IconName | null,
  onClick = () => {},
  options: controlButtonOptionals = {}
) {
  const opts: controlButtonOptionals = { ...defaultOptions, ...options }
  const props: IButtonProps = { onClick }
  props.intent = opts.intent === undefined ? Intent.NONE : opts.intent
  props.minimal = opts.minimal !== undefined && opts.minimal ? true : false
  props.className = opts.className
  if (icon) {
    opts.iconOnRight ? (props.rightIcon = icon) : (props.icon = icon)
  }
  return <Button {...props}>{label}</Button>
}
