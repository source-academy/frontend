# Route Refactoring Plan: `src/new_routes/`

## Objective

Organize routes under `src/new_routes/` following file-based URL conventions. File names mirror URL paths (e.g., `folder/[id].tsx` for params), dynamic segments use `[param]` naming, and shared layouts are prefixed with `_`. Route configuration, guards, and loaders remain in `routerConfig.ts` - this is purely file reorganization.

## Component Export Style

Each route file re-exports the component from `src/pages/` with a named `Component` export:

```tsx
import { LoginPage } from 'src/pages/login/LoginPage';

function LoginPageComponent() {
  return <LoginPage />;
}

export const Component = LoginPageComponent;
```

**Rules:**

- No `React.FC` or arrow function components
- Use function declarations (`function Name()`)
- No default exports - must use named `Component` export
- No route guards - handled in router config
- No loaders - handled in router config
- No Outlet or wrapper logic

## File Naming Conventions

| Pattern | Example | Use Case |
|---------|---------|----------|
| `[param]` | `[courseId].tsx` | Dynamic path parameters |
| `[param]?` | Handled in component | Optional parameters |
| `_layout` | `_layout.tsx` | Shared layout (only if wrapper logic needed) |
| `index` | `index.tsx` | Folder-index routes |

## Route Structure Mapping

### Top-Level Routes (`routerConfig.ts`)

| URL Path | New File Location |
|----------|-----------------|
| `/nus_login` | `nus_login/index.tsx` |
| `/login` | `login/index.tsx` |
| `/login/callback` | `login/callback.tsx` |
| `/login/vscode_callback` | `login/vscode_callback.tsx` |
| `/welcome` | `welcome.tsx` |
| `/courses/:courseId/*` | `courses/[courseId]/...` |
| `/playground/:playgroundCode?` | `playground/[playgroundCode].tsx` |
| `/mission-control/:assessmentId?/:questionId?` | `mission-control/[assessmentId]/[questionId].tsx` |
| `/contributors` | `contributors.tsx` |
| `/callback/github` | `callback/github.tsx` |
| `/sicpjs/:section?` | `sicpjs/[section].tsx` |
| `/features` | `features.tsx` |

### Academy Routes (`academyRoutes.ts`)

| URL Path | New File Location |
|----------|-----------------|
| `/courses/:courseId` (index) | `courses/[courseId]/index.tsx` |
| `/courses/:courseId/game` | `courses/[courseId]/game.tsx` |
| `/courses/:courseId/:assessmentConfigType/:assessmentId` | `courses/[courseId]/[assessmentConfigType]/[assessmentId].tsx` |
| `/courses/:courseId/achievements/*` | `courses/[courseId]/achievements/[...].tsx` |
| `/courses/:courseId/leaderboard` | `courses/[courseId]/leaderboard/index.tsx` |
| `/courses/:courseId/leaderboard/overall` | `courses/[courseId]/leaderboard/overall.tsx` |
| `/courses/:courseId/leaderboard/contests/:contestId?/:leaderboardType` | `courses/[courseId]/leaderboard/contests/[contestId]/[leaderboardType].tsx` |
| `/courses/:courseId/grading/:submissionId` | `courses/[courseId]/grading/[submissionId].tsx` |
| `/courses/:courseId/gamesimulator` | `courses/[courseId]/gamesimulator.tsx` |
| `/courses/:courseId/teamformation` | `courses/[courseId]/teamformation/index.tsx` |
| `/courses/:courseId/teamformation/create` | `courses/[courseId]/teamformation/create.tsx` |
| `/courses/:courseId/teamformation/edit/:teamId` | `courses/[courseId]/teamformation/edit/[teamId].tsx` |
| `/courses/:courseId/teamformation/import` | `courses/[courseId]/teamformation/import.tsx` |
| `/courses/:courseId/dashboard` | `courses/[courseId]/dashboard.tsx` |
| `/courses/:courseId/groundcontrol` | `courses/[courseId]/groundcontrol.tsx` |
| `/courses/:courseId/adminpanel` | `courses/[courseId]/adminpanel.tsx` |

## Proposed Directory Structure

```
src/new_routes/
├── nus_login/
│   └── index.tsx                  # NusLogin
├── login/
│   ├── index.tsx                  # LoginPage
│   ├── callback.tsx                # LoginCallback
│   └── vscode_callback.tsx         # LoginVscodeCallback
├── welcome.tsx                     # Welcome
├── playground/
│   └── [playgroundCode].tsx        # Playground (optional param)
├── mission-control/
│   └── [assessmentId]/
│       └── [questionId].tsx        # MissionControl (optional params)
├── courses/
│   └── [courseId]/
│       ├── index.tsx               # Academy index
│       ├── game.tsx                # Game
│       ├── [assessmentConfigType]/
│       │   └── [assessmentId].tsx   # Assessment
│       ├── achievements/
│       │   └── [...].tsx            # Achievement
│       ├── leaderboard/
│       │   ├── index.tsx            # Leaderboard
│       │   ├── overall.tsx         # OverallLeaderboard
│       │   └── contests/
│       │       └── [contestId]/
│       │           └── [leaderboardType].tsx  # ContestLeaderboardWrapper
│       ├── grading/
│       │   └── [submissionId].tsx   # Grading
│       ├── gamesimulator.tsx       # GameSimulator
│       ├── teamformation/
│       │   ├── index.tsx           # TeamFormation
│       │   ├── create.tsx          # TeamFormationForm
│       │   ├── edit/
│       │   │   └── [teamId].tsx    # TeamFormationForm
│       │   └── import.tsx          # TeamFormationImport
│       ├── dashboard.tsx           # Dashboard
│       ├── groundcontrol.tsx       # GroundControl
│       └── adminpanel.tsx          # AdminPanel
├── contributors.tsx                # Contributors
├── callback/
│   └── github.tsx                  # GitHubCallback
├── sicpjs/
│   └── [section].tsx               # Sicp (optional section)
├── features.tsx                    # FeatureFlags
└── notFound.tsx                    # NotFound
```

## Implementation Steps

1. **Create `src/new_routes/` directory**
2. **Create login routes**: `nus_login/`, `login/`
3. **Create public routes**: `welcome.tsx`, `playground/`, `contributors.tsx`, `callback/`, `sicpjs/`, `features.tsx`
4. **Create academy routes**: `courses/[courseId]/` with all sub-routes
5. **Create leaderboard sub-structure**: `leaderboard/` with nested contest routes
6. **Create teamformation sub-structure**: `teamformation/` with create/edit/import
7. **Verify all routes**: Ensure every existing route is represented
