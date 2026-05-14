# Route Refactoring Plan: `src/new_routes/`

## Objective

Refactor pages to follow modern file-based routing conventions under `src/new_routes/`, where file names mirror URL paths. Dynamic segments use `[param]` naming, and shared layouts are prefixed with `_`.

## Route Structure Mapping

### Current Routes Analysis

**From `routerConfig.ts` (top-level routes):**

| Current Path | New File Location |
|-------------|-------------------|
| `/nus_login` | `nus_login/_layout.tsx` + `nus_login/index.tsx` |
| `/login` | `login/_layout.tsx` + `login/index.tsx` |
| `/login/callback` | `login/callback.tsx` |
| `/login/vscode_callback` | `login/vscode_callback.tsx` |
| `/welcome` | `welcome.tsx` |
| `/courses/:courseId/*` | `courses/[courseId]/_layout.tsx` + nested routes |
| `/playground/:playgroundCode?` | `playground/[playgroundCode].tsx` |
| `/mission-control/:assessmentId?/:questionId?` | `mission-control/[assessmentId]/[questionId].tsx` |
| `/contributors` | `contributors.tsx` |
| `/callback/github` | `callback/github.tsx` |
| `/sicpjs/:section?` | `sicpjs/[section].tsx` |
| `/features` | `features.tsx` |

**From `academyRoutes.ts` (academy nested routes):**

| Current Path | New File Location |
|-------------|-------------------|
| `/courses/:courseId` (index) | `courses/[courseId]/index.tsx` (redirects to game/assessment) |
| `/courses/:courseId/game` | `courses/[courseId]/game.tsx` |
| `/courses/:courseId/:assessmentConfigType/:assessmentId` | `courses/[courseId]/[assessmentConfigType]/[assessmentId].tsx` |
| `/courses/:courseId/achievements/*` | `courses/[courseId]/achievements/...` |
| `/courses/:courseId/leaderboard` | `courses/[courseId]/leaderboard/_layout.tsx` |
| `/courses/:courseId/leaderboard/overall` | `courses/[courseId]/leaderboard/overall.tsx` |
| `/courses/:courseId/leaderboard/contests/:contestId?/:leaderboardType` | `courses/[courseId]/leaderboard/contests/[contestId]/[leaderboardType].tsx` |
| `/courses/:courseId/grading/:submissionId` | `courses/[courseId]/grading/[submissionId].tsx` |
| `/courses/:courseId/gamesimulator` | `courses/[courseId]/gamesimulator.tsx` |
| `/courses/:courseId/teamformation` | `courses/[courseId]/teamformation/_layout.tsx` |
| `/courses/:courseId/teamformation/create` | `courses/[courseId]/teamformation/create.tsx` |
| `/courses/:courseId/teamformation/edit/:teamId` | `courses/[courseId]/teamformation/edit/[teamId].tsx` |
| `/courses/:courseId/teamformation/import` | `courses/[courseId]/teamformation/import.tsx` |
| `/courses/:courseId/dashboard` | `courses/[courseId]/dashboard.tsx` |
| `/courses/:courseId/groundcontrol` | `courses/[courseId]/groundcontrol.tsx` |
| `/courses/:courseId/adminpanel` | `courses/[courseId]/adminpanel.tsx` |

## Proposed Directory Structure

```
src/new_routes/
├── _layout.tsx                    # Root layout (Application wrapper)
├── index.tsx                      # Root redirect based on auth state
├── nus_login/
│   ├── _layout.tsx               # Auth layout for NUS login
│   └── index.tsx                 # NusLogin component
├── login/
│   ├── _layout.tsx               # Auth layout with provider redirect
│   ├── index.tsx                 # LoginPage component
│   ├── callback.tsx               # LoginCallback component
│   └── vscode_callback.tsx       # LoginVscodeCallback component
├── welcome.tsx                    # Welcome page
├── playground/
│   └── [playgroundCode].tsx       # Playground with optional code param
├── mission-control/
│   └── [assessmentId]/
│       └── [questionId].tsx       # MissionControl with optional params
├── courses/
│   └── [courseId]/
│       ├── _layout.tsx            # Academy layout with auth guards
│       ├── index.tsx              # Academy index (redirect to game/assessment)
│       ├── game.tsx               # Game component (guarded: enableGame)
│       ├── [assessmentConfigType]/
│       │   └── [assessmentId].tsx # Assessment component
│       ├── achievements/
│       │   └── [...].tsx          # Achievement catch-all
│       ├── leaderboard/
│       │   ├── _layout.tsx        # Leaderboard layout with loader
│       │   ├── overall.tsx        # OverallLeaderboard
│       │   └── contests/
│       │       └── [contestId]/
│       │           └── [leaderboardType].tsx  # ContestLeaderboardWrapper
│       ├── grading/
│       │   └── [submissionId].tsx  # Grading component (Staff/Admin only)
│       ├── gamesimulator.tsx      # GameSimulator (Staff/Admin only)
│       ├── teamformation/
│       │   ├── _layout.tsx        # TeamFormation layout
│       │   ├── index.tsx          # TeamFormation main
│       │   ├── create.tsx          # TeamFormationForm
│       │   ├── edit/
│       │   │   └── [teamId].tsx   # TeamFormationForm for editing
│       │   └── import.tsx          # TeamFormationImport
│       ├── dashboard.tsx          # Dashboard (Staff/Admin only)
│       ├── groundcontrol.tsx      # GroundControl (Admin only)
│       └── adminpanel.tsx         # AdminPanel (Admin only)
├── contributors.tsx                # Contributors page
├── callback/
│   └── github.tsx                  # GitHubCallback
├── sicpjs/
│   └── [section].tsx               # Sicp with optional section param
├── features.tsx                    # FeatureFlags page
└── notFound.tsx                    # NotFound page
```

## Naming Conventions

| Convention | Example | Use Case |
|------------|---------|----------|
| `[param]` | `[courseId].tsx` | Dynamic path parameters |
| `[param]?` | `[section].tsx` | Optional parameters (handled in component) |
| `[...rest]` | `[...].tsx` | Catch-all/catch-remaining segments |
| `_layout` | `_layout.tsx` | Shared layout for multiple routes in folder |
| `_authLayout` | `_authLayout.tsx` | Named layout when multiple layouts exist |
| `index` | `index.tsx` | Folder-index routes (same as folder path) |

## Route Guards Integration

Each route file will include its guard logic:

```tsx
// Example: game.tsx (guarded route)
import { GuardedRoute } from 'src/routes/routeGuard';

export const gameRoute = new GuardedRoute({
  path: 'game',
  lazy: () => import('src/pages/academy/game/Game'),
})
  .check(s => !!s.session.enableGame, notFoundPath)
  .build();
```

## Implementation Steps

1. **Create root structure**: `_layout.tsx`, `index.tsx`, `notFound.tsx`
2. **Create auth routes**: `nus_login/`, `login/` with layouts
3. **Create public routes**: `welcome.tsx`, `playground/`, `contributors.tsx`, etc.
4. **Create academy routes**: `courses/[courseId]/` with all sub-routes
5. **Create leaderboard sub-structure**: `leaderboard/` with nested contest routes
6. **Create teamformation sub-structure**: `teamformation/` with create/edit/import
7. **Apply route guards**: Add guard checks to staff/admin routes
8. **Update routerConfig**: Point to new route structure
9. **Verify all routes**: Ensure every existing route is represented

## Migration Notes

- Keep existing components in `src/pages/` - only reorganize routes
- Route guards (GuardedRoute) remain in `src/routes/routeGuard.ts`
- Academy routes use `assessmentRegExp`, `gradingRegExp`, `teamRegExp` from `AcademyTypes`
- The root `Application` component wraps the main layout
