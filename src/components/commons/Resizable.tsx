import * as ResizableOriginal from 're-resizable'

export { default as ResizableElement } from 're-resizable'
export * from 're-resizable'
export default (ResizableOriginal instanceof Function
  ? ResizableOriginal
  : (ResizableOriginal as any).default)
