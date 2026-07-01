// Import-map shim: resolves a plugin bundle's `import ... from "react/jsx-runtime"` to the host
// frontend's React jsx-runtime (exposed on globalThis by src/bootstrap/conductorSharedDeps.ts).
if (!globalThis.__SA_REACT_JSX__) {
  throw new Error('[shim] __SA_REACT_JSX__ is not defined — conductorSharedDeps.ts may not have run yet');
}
const jsxRuntime = globalThis.__SA_REACT_JSX__;
export const { jsx, jsxs, Fragment } = jsxRuntime;
