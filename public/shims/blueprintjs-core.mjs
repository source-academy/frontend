// Import-map shim: resolves a plugin bundle's `import ... from "@blueprintjs/core"` to the host
// frontend's Blueprint build (exposed on globalThis by src/bootstrap/conductorSharedDeps.ts), so the
// plugin's Blueprint components share the host's CSS and React instance.
//
// Re-exports the surface used by the bundled plugins; extend this list if a plugin needs more.
const Blueprint = globalThis.__SA_BLUEPRINT__;
export const {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Divider,
  Icon,
  Popover,
  Pre,
  Slider,
} = Blueprint;
