# Source Academy Frontend

The Source Academy Frontend is a React.js TypeScript web application for an immersive online programming education platform. It features a coding playground, SICP JS textbook integration, assessment system, grading tools, collaborative sessions, and game elements. The application is built with React 18, Redux, TypeScript, and modern tooling.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Environment Setup

- Node.js version: 20.9.0+ (as specified in `.node-version`)
- Package manager: Yarn 4.6.0 (managed via corepack)
- Enable corepack: `corepack enable`

### Bootstrap and Build Process

1. **Install dependencies** (25 seconds):

   ```bash
   corepack enable
   yarn install
   ```

   **NOTE**: Installation may fail due to network restrictions accessing `cdn.sheetjs.com` for the xlsx package. If this occurs, temporarily modify `package.json` to use `"xlsx": "^0.18.5"` instead of the CDN URL, run `yarn install --mode update-lockfile`, then `yarn install`.

2. **TypeScript compilation** (20 seconds):

   ```bash
   yarn run tsc --noEmit
   ```

3. **Linting** (7 seconds):

   ```bash
   yarn run eslint
   ```

4. **Format checks** (10 seconds):

   ```bash
   yarn run format:ci
   ```

5. **Production build** (40 seconds, **NEVER CANCEL**):

   ```bash
   yarn run build
   ```

   **CRITICAL**: Set timeout to 60+ minutes. Build completes in ~40 seconds but may take longer on slower systems.

6. **Test suite** (1 minute 45 seconds, **NEVER CANCEL**):

   ```bash
   yarn run test
   ```

   **CRITICAL**: Set timeout to 30+ minutes. One test may fail due to network restrictions accessing `sicp.sourceacademy.org`.

### Development Server

- **Start development server** (16 seconds build + server startup):

  ```bash
  yarn run start
  ```

- **Access**: <http://localhost:8000>
- **Hot reload**: Enabled with live updates

## Validation

### Manual Testing Requirements

**ALWAYS run through at least one complete end-to-end scenario after making changes:**

1. **Basic Playground Functionality**:
   - Navigate to <http://localhost:8000> (redirects to /playground)
   - Verify the editor loads with syntax highlighting
   - Write test code: `function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); } factorial(5);`
   - Click "Run" button
   - Verify output "120" appears in the result panel
   - Test REPL by typing expressions in the bottom panel

2. **Navigation and UI**:
   - Verify navigation bar with "Playground" and "SICP JS" links
   - Test language selector (Source §1 through §4)
   - Verify all toolbar buttons are functional (Run, Share, Session, Folder, Google Drive, GitHub)
   - Check welcome message and documentation links work

3. **Build Validation**:
   - **ALWAYS** run `yarn run format` and `yarn run eslint` before committing
   - The CI workflow (`.github/workflows/ci.yml`) runs: `tsc`, `format:ci`, `eslint`, `build`, `test --bail=1`, `test-coveralls`

## Network Limitations

**Important**: Several external services are not accessible in sandboxed environments:

- `cdn.sheetjs.com` - xlsx package installation fails
- `sicp.sourceacademy.org` - SICP JS content fails to load
- `fonts.googleapis.com`, `apis.google.com` - Google services blocked
- These failures are expected and should be documented as "fails due to network limitations"

## Common Tasks

### Repository Structure

```
/home/runner/work/frontend/frontend/
├── .github/workflows/        # CI/CD pipelines
├── .node-version            # Node.js 20.9.0
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── rsbuild.config.ts       # Build configuration (replaces webpack)
├── vitest.config.ts        # Test configuration
├── src/
│   ├── assets/             # Static assets
│   ├── commons/            # Shared components and utilities
│   ├── features/           # Redux features (actions, reducers, sagas)
│   ├── pages/              # Page components matching routes
│   └── styles/             # SCSS stylesheets
├── public/                 # Public static files
└── scripts/                # Utility scripts
```

### Key npm Scripts

- `yarn start` - Development server (<http://localhost:8000>)
- `yarn build` - Production build (40s, outputs to `build/`)
- `yarn test` - Test suite (1m45s, may have 1 network-related failure)
- `yarn format` - Auto-fix code formatting (ESLint + Prettier)
- `yarn format:ci` - Check formatting without changes
- `yarn eslint` - Lint TypeScript/JavaScript code
- `yarn tsc` - TypeScript compilation check

### Environment Configuration

Copy `.env.example` to `.env` and configure:

- `REACT_APP_BACKEND_URL` - Backend API endpoint
- `REACT_APP_USE_BACKEND` - Enable/disable backend integration
- `REACT_APP_PLAYGROUND_ONLY` - Playground-only mode for GitHub Pages
- Authentication providers, Google Drive, GitHub integration settings

### Memory Requirements

The build process requires significant memory:

- Set `NODE_OPTIONS=--max_old_space_size=8192` for CI/CD
- Local development typically works with default Node.js memory limits

### Technology Stack

- **Frontend**: React 18.3.1 with TypeScript 5.8.2
- **State Management**: Redux Toolkit with Redux Saga
- **Build Tool**: rsbuild (modern webpack replacement)
- **Testing**: Vitest with jsdom environment
- **Styling**: SCSS with Blueprint UI components
- **Linting**: ESLint 9 with TypeScript rules
- **Code Editor**: ACE editor with Source language support

### Debugging Tips

- Check browser console for React DevTools and HMR connection messages
- Build warnings about missing Node.js modules (perf_hooks) are expected in browser builds
- ESLint warnings about React hooks dependencies are common and generally safe
- Use `yarn run test:watch` for interactive test development
- Use `yarn run test:ui` for browser-based test UI

**Remember**: Always validate functionality manually by running the application and testing user scenarios. The playground must be able to execute code and display results correctly.
