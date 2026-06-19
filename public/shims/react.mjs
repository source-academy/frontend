// Import-map shim: resolves a plugin bundle's `import ... from "react"` to the host frontend's
// single React instance (exposed on globalThis by src/bootstrap/conductorSharedDeps.ts).
if (!globalThis.__SA_REACT__) {
  throw new Error('[shim] __SA_REACT__ is not defined — conductorSharedDeps.ts may not have run yet');
}
const React = globalThis.__SA_REACT__;
export default React.default ?? React;
export const {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  use,
  useActionState,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} = React;
