/**
 * Exposes the frontend's singleton library instances so that dynamically-imported Conductor web
 * plugin bundles can share them, rather than bundling (and duplicating) their own copies.
 *
 * Plugin bundles import `react`, `react/jsx-runtime` and `@blueprintjs/core` as bare specifiers.
 * The import map in `public/index.html` maps those specifiers to the shim modules in `public/shims`,
 * which re-export the globals set here. The result: the plugin renders inside the host's single
 * React tree and uses the host's exact Blueprint build (so styling is identical).
 *
 * This module must be imported before any plugin is loaded; it is imported first from `index.tsx`.
 */
import * as Blueprint from '@blueprintjs/core';
// eslint-disable-next-line no-restricted-imports
import * as React from 'react';
import * as ReactJsxRuntime from 'react/jsx-runtime';

const globals = globalThis as Record<string, unknown>;
globals.__SA_REACT__ = React;
globals.__SA_REACT_JSX__ = ReactJsxRuntime;
globals.__SA_BLUEPRINT__ = Blueprint;
