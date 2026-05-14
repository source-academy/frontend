# Route Refactoring Plan: `src/new_routes/`

## Objective

Move page files from `src/pages/` to `src/new_routes/` following file-based URL conventions. File names mirror URL paths (e.g., `folder/[id].tsx` for params). This is a file reorganization - delete old locations, move to new location, no duplication.

## File Operations

- **Move**: Delete original file, create at new location with URL-based name
- **Rename**: Files may be renamed to match URL conventions (e.g., `LoginPage.tsx` stays or becomes `index.tsx` if it's the index route)

## Component Export Style

After move, components should use function declarations with named `Component` export:

```tsx
function LoginPage() {
  return <div>...</div>;
}

export const Component = LoginPage;
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
| `_layout` | `_layout.tsx` | Layout wrapper (only if needed, rare) |
| `index` | `index.tsx` | Folder-index routes (when route is just `/folder`) |

## Route Structure Mapping

### Top-Level Routes

| Original Location | New Location |
|-------------------|--------------|
| `src/pages/login/Login.tsx` | `src/new_routes/login/Login.tsx` |
| `src/pages/login/LoginPage.tsx` | `src/new_routes/login/index.tsx` |
| `src/pages/login/LoginCallback.tsx` | `src/new_routes/login/callback.tsx` |
| `src/pages/login/LoginVscodeCallback.tsx` | `src/new_routes/login/vscode_callback.tsx` |
| `src/pages/login/NusLogin.tsx` | `src/new_routes/nus_login/index.tsx` |
| `src/pages/welcome/Welcome.tsx` | `src/new_routes/welcome/index.tsx` |
| `src/pages/playground/Playground.tsx` | `src/new_routes/playground/[playgroundCode].tsx` |
| `src/pages/missionControl/MissionControl.tsx` | `src/new_routes/mission-control/[assessmentId]/[questionId].tsx` |
| `src/pages/contributors/Contributors.tsx` | `src/new_routes/contributors/index.tsx` |
| `src/pages/githubCallback/GitHubCallback.tsx` | `src/new_routes/callback/github/index.tsx` |
| `src/pages/sicp/Sicp.tsx` | `src/new_routes/sicpjs/[section].tsx` |
| `src/pages/featureFlags/FeatureFlags.tsx` | `src/new_routes/features/index.tsx` |
| `src/pages/notFound/NotFound.tsx` | `src/new_routes/notFound/index.tsx` |

### Academy Routes

| Original Location | New Location |
|-------------------|--------------|
| `src/pages/academy/Academy.tsx` | `src/new_routes/courses/[courseId]/index.tsx` |
| `src/pages/academy/game/Game.tsx` | `src/new_routes/courses/[courseId]/game/index.tsx` |
| `src/pages/achievement/Achievement.tsx` | `src/new_routes/courses/[courseId]/achievements/index.tsx` |
| `src/commons/assessment/Assessment.tsx` | `src/new_routes/courses/[courseId]/[assessmentConfigType]/[assessmentId].tsx` |
| `src/pages/leaderboard/subcomponents/OverallLeaderboard.tsx` | `src/new_routes/courses/[courseId]/leaderboard/overall/index.tsx` |
| `src/pages/leaderboard/subcomponents/ContestLeaderboardWrapper.tsx` | `src/new_routes/courses/[courseId]/leaderboard/contests/[contestId]/[leaderboardType]/index.tsx` |
| `src/pages/academy/grading/Grading.tsx` | `src/new_routes/courses/[courseId]/grading/[submissionId]/index.tsx` |
| `src/pages/academy/gameSimulator/GameSimulator.tsx` | `src/new_routes/courses/[courseId]/gamesimulator/index.tsx` |
| `src/pages/academy/teamFormation/TeamFormation.tsx` | `src/new_routes/courses/[courseId]/teamformation/index.tsx` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` | `src/new_routes/courses/[courseId]/teamformation/create/index.tsx` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` | `src/new_routes/courses/[courseId]/teamformation/edit/[teamId]/index.tsx` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationImport.tsx` | `src/new_routes/courses/[courseId]/teamformation/import/index.tsx` |
| `src/pages/academy/dashboard/Dashboard.tsx` | `src/new_routes/courses/[courseId]/dashboard/index.tsx` |
| `src/pages/academy/groundControl/GroundControl.tsx` | `src/new_routes/courses/[courseId]/groundcontrol/index.tsx` |
| `src/pages/academy/adminPanel/AdminPanel.tsx` | `src/new_routes/courses/[courseId]/adminpanel/index.tsx` |

## Proposed Directory Structure

```
src/new_routes/
├── login/
│   ├── Login.tsx
│   ├── index.tsx            # LoginPage
│   ├── callback.tsx          # LoginCallback
│   └── vscode_callback.tsx   # LoginVscodeCallback
├── nus_login/
│   └── index.tsx            # NusLogin
├── welcome/
│   └── index.tsx            # Welcome
├── playground/
│   └── [playgroundCode].tsx  # Playground
├── mission-control/
│   └── [assessmentId]/
│       └── [questionId].tsx  # MissionControl
├── courses/
│   └── [courseId]/
│       ├── index.tsx         # Academy
│       ├── game/
│       │   └── index.tsx     # Game
│       ├── achievements/
│       │   └── index.tsx     # Achievement
│       ├── [assessmentConfigType]/
│       │   └── [assessmentId].tsx  # Assessment
│       ├── leaderboard/
│       │   ├── index.tsx     # Leaderboard
│       │   ├── overall/
│       │   │   └── index.tsx # OverallLeaderboard
│       │   └── contests/
│       │       └── [contestId]/
│       │           └── [leaderboardType]/
│       │               └── index.tsx  # ContestLeaderboardWrapper
│       ├── grading/
│       │   └── [submissionId]/
│       │       └── index.tsx  # Grading
│       ├── gamesimulator/
│       │   └── index.tsx     # GameSimulator
│       ├── teamformation/
│       │   ├── index.tsx    # TeamFormation
│       │   ├── create/
│       │   │   └── index.tsx  # TeamFormationForm
│       │   ├── edit/
│       │   │   └── [teamId]/
│       │   │       └── index.tsx  # TeamFormationForm
│       │   └── import/
│       │       └── index.tsx  # TeamFormationImport
│       ├── dashboard/
│       │   └── index.tsx     # Dashboard
│       ├── groundcontrol/
│       │   └── index.tsx     # GroundControl
│       └── adminpanel/
│           └── index.tsx     # AdminPanel
├── contributors/
│   └── index.tsx            # Contributors
├── callback/
│   └── github/
│       └── index.tsx         # GitHubCallback
├── sicpjs/
│   └── [section].tsx        # Sicp
├── features/
│   └── index.tsx            # FeatureFlags
└── notFound/
    └── index.tsx            # NotFound
```

## Implementation Steps

1. **Create `src/new_routes/` directory structure**
2. **Move login routes**: `login/`, `nus_login/`
3. **Move public routes**: `welcome/`, `playground/`, `contributors/`, `callback/`, `sicpjs/`, `features/`, `notFound/`
4. **Move academy routes**: `courses/[courseId]/` with all sub-routes
5. **Move leaderboard sub-structure**: `leaderboard/` with nested contest routes
6. **Move teamformation sub-structure**: `teamformation/` with create/edit/import
7. **Update routerConfig**: Update all import paths to point to new locations
8. **Delete old files**: Remove files from `src/pages/` after successful migration
9. **Verify all routes**: Ensure every route loads correctly
