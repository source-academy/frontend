declare module 'acorn/dist/walk' {
  import * as es from 'estree'

  namespace AcornWalk {
    export type SimpleWalker<S> = (node: es.Node, state?: S) => void
    export type SimpleWalkers<S> = { [name: string]: SimpleWalker<S> }
    export type Walker<T extends es.Node, S> = (
      node: T,
      state: S,
      callback: SimpleWalker<S>
    ) => void
    export type Walkers<S> = { [name: string]: Walker<any, S> }
    type NodeTest = (nodeType: string, node: es.Node) => boolean

    export const base: Walkers<any>

    export function simple<S>(
      node: es.Node,
      visitors: SimpleWalkers<S>,
      base?: SimpleWalkers<S>,
      state?: S
    ): void
    export function recursive<S>(node: es.Node, state: S, functions: Walkers<S>): void
    export function findNodeAt<S>(
      node: es.Node,
      start: null | number,
      end: null | number,
      test: string | NodeTest,
      base?: SimpleWalkers<S>,
      state?: S
    ): void
    export function findNodeAround<S>(
      node: es.Node,
      pos: es.Position,
      test: string | NodeTest,
      base?: SimpleWalkers<S>,
      state?: S
    ): void
    export function findNodeAfter<S>(
      node: es.Node,
      pos: es.Position,
      test: string | NodeTest,
      base?: SimpleWalkers<S>,
      state?: S
    ): void
  }

  export = AcornWalk
}
