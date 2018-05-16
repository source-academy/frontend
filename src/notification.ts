import { Toaster, Position, Intent } from '@blueprintjs/core'

const notification = Toaster.create({
  position: Position.TOP
})

export const showSuccessMessage = (message: string, timeout = 500) => {
  notification.show({
    intent: Intent.SUCCESS,
    message,
    timeout
  })
}

export const showWarningMessage = (message: string, timeout = 500) => {
  notification.show({
    intent: Intent.WARNING,
    message,
    timeout
  })
}
