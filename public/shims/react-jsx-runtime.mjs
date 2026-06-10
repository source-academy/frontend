// Import-map shim: resolves a plugin bundle's `import ... from "react/jsx-runtime"` to the host
// frontend's React jsx-runtime (exposed on globalThis by src/bootstrap/conductorSharedDeps.ts).
const jsxRuntime = globalThis.__SA_REACT_JSX__;
export const { jsx, jsxs, Fragment } = jsxRuntime;
