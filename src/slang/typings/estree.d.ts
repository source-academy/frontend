import estree from 'estree'

declare module 'estree' {
  interface BaseNode {
    __id?: string
    __call?: string
  }
}
