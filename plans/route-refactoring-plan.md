# Route Refactoring Plan: `src/new_routes/`

## Objective

Move and rename page files from `src/pages/` to `src/new_routes/` following file-based URL conventions. File names match URL paths (e.g., `login.tsx` for `/login`, `login/callback.tsx` for `/login/callback`). Dynamic segments use `[param]` naming. Update all imports accordingly.

## File Naming Rules

| URL Path | File Location | Notes |
|----------|---------------|-------|
| `/login` | `login.tsx` | Single segment → single file |
| `/login/callback` | `login/callback.tsx` | Nested segment → nested file |
| `/playground/:playgroundCode` | `playground/[playgroundCode].tsx` | Dynamic param |
| `/courses/:courseId` | `courses/[courseId].tsx` | Dynamic param at folder level |

- Use `index.tsx` only when the URL is exactly the folder path with nothing after
- `LoginPage` component in `LoginPage.tsx` → file `login.tsx`, component function renamed to `login`
- Update all imports (internal and external) to match new file locations

## File Operations

1. **Move + Rename**: Delete original, create at new location with URL-based name
2. **Rename component**: If component name differs from filename, rename to match filename (e.g., `LoginPage` → `login`)
3. **Update exports**: Named `Component` export matching the function name
4. **Fix imports**: Update all internal imports within `src/new_routes/` and from external files

## Component Export Style

```tsx
function login() {
  return <div>...</div>;
}

export const Component = login;
```

**Rules:**

- No `React.FC` or arrow function components
- Use function declarations
- Named `Component` export matching function name
- No default exports

## Route Structure Mapping

### Top-Level Routes

| Original File | Component | New Location | New Component |
|---------------|-----------|--------------|---------------|
| `src/pages/login/LoginPage.tsx` | `LoginPage` | `src/new_routes/login.tsx` | `login` |
| `src/pages/login/LoginCallback.tsx` | `LoginCallback` | `src/new_routes/login/callback.tsx` | `callback` |
| `src/pages/login/LoginVscodeCallback.tsx` | `LoginVscodeCallback` | `src/new_routes/login/vscode_callback.tsx` | `vscode_callback` |
| `src/pages/login/NusLogin.tsx` | `NusLogin` | `src/new_routes/nus_login.tsx` | `nus_login` |
| `src/pages/welcome/Welcome.tsx` | `Welcome` | `src/new_routes/welcome.tsx` | `welcome` |
| `src/pages/playground/Playground.tsx` | `Playground` | `src/new_routes/playground/[playgroundCode].tsx` | `playground` |
| `src/pages/missionControl/MissionControl.tsx` | `MissionControl` | `src/new_routes/mission-control/[assessmentId]/[questionId].tsx` | `mission_control` |
| `src/pages/contributors/Contributors.tsx` | `Contributors` | `src/new_routes/contributors.tsx` | `contributors` |
| `src/pages/githubCallback/GitHubCallback.tsx` | `GitHubCallback` | `src/new_routes/callback/github.tsx` | `github` |
| `src/pages/sicp/Sicp.tsx` | `Sicp` | `src/new_routes/sicpjs/[section].tsx` | `sicpjs` |
| `src/pages/featureFlags/FeatureFlags.tsx` | `FeatureFlags` | `src/new_routes/features.tsx` | `features` |
| `src/pages/notFound/NotFound.tsx` | `NotFound` | `src/new_routes/notFound.tsx` | `notFound` |

### Academy Routes

| Original File | Component | New Location | New Component |
|---------------|-----------|--------------|---------------|
| `src/pages/academy/Academy.tsx` | `Academy` | `src/new_routes/courses/[courseId].tsx` | `course` |
| `src/pages/academy/game/Game.tsx` | `Game` | `src/new_routes/courses/[courseId]/game.tsx` | `game` |
| `src/pages/achievement/Achievement.tsx` | `Achievement` | `src/new_routes/courses/[courseId]/achievements.tsx` | `achievements` |
| `src/commons/assessment/Assessment.tsx` | `Assessment` | `src/new_routes/courses/[courseId]/[assessmentConfigType]/[assessmentId].tsx` | `assessment` |
| `src/pages/leaderboard/subcomponents/OverallLeaderboard.tsx` | `OverallLeaderboard` | `src/new_routes/courses/[courseId]/leaderboard/overall.tsx` | `overall` |
| `src/pages/leaderboard/subcomponents/ContestLeaderboardWrapper.tsx` | `ContestLeaderboardWrapper` | `src/new_routes/courses/[courseId]/leaderboard/contests/[contestId]/[leaderboardType].tsx` | `contest_leaderboard` |
| `src/pages/academy/grading/Grading.tsx` | `Grading` | `src/new_routes/courses/[courseId]/grading/[submissionId].tsx` | `grading` |
| `src/pages/academy/gameSimulator/GameSimulator.tsx` | `GameSimulator` | `src/new_routes/courses/[courseId]/gamesimulator.tsx` | `gamesimulator` |
| `src/pages/academy/teamFormation/TeamFormation.tsx` | `TeamFormation` | `src/new_routes/courses/[courseId]/teamformation.tsx` | `teamformation` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` | `TeamFormationForm` | `src/new_routes/courses/[courseId]/teamformation/create.tsx` | `create` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` | `TeamFormationForm` | `src/new_routes/courses/[courseId]/teamformation/edit/[teamId].tsx` | `edit` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationImport.tsx` | `TeamFormationImport` | `src/new_routes/courses/[courseId]/teamformation/import.tsx` | `import` |
| `src/pages/academy/dashboard/Dashboard.tsx` | `Dashboard` | `src/new_routes/courses/[courseId]/dashboard.tsx` | `dashboard` |
| `src/pages/academy/groundControl/GroundControl.tsx` | `GroundControl` | `src/new_routes/courses/[courseId]/groundcontrol.tsx` | `groundcontrol` |
| `src/pages/academy/adminPanel/AdminPanel.tsx` | `AdminPanel` | `src/new_routes/courses/[courseId]/adminpanel.tsx` | `adminpanel` |

## Proposed Directory Structure

```
src/new_routes/
├── login.tsx                   # /login -> login
├── login/
│   ├── callback.tsx            # /login/callback -> callback
│   └── vscode_callback.tsx     # /login/vscode_callback -> vscode_callback
├── nus_login.tsx               # /nus_login -> nus_login
├── welcome.tsx                 # /welcome -> welcome
├── playground/
│   └── [playgroundCode].tsx    # /playground/:playgroundCode -> playground
├── mission-control/
│   └── [assessmentId]/
│       └── [questionId].tsx    # /mission-control/:assessmentId/:questionId -> mission_control
├── courses/
│   └── [courseId].tsx          # /courses/:courseId -> course
│   └── [courseId]/
│       ├── game.tsx            # /courses/:courseId/game -> game
│       ├── achievements.tsx     # /courses/:courseId/achievements -> achievements
│       ├── [assessmentConfigType]/
│       │   └── [assessmentId].tsx  # /courses/:courseId/:type/:id -> assessment
│       ├── leaderboard/
│       │   ├── overall.tsx     # /courses/:courseId/leaderboard/overall -> overall
│       │   └── contests/
│       │       └── [contestId]/
│       │           └── [leaderboardType].tsx  # /contests/:id/:type -> contest_leaderboard
│       ├── grading/
│       │   └── [submissionId].tsx  # /grading/:id -> grading
│       ├── gamesimulator.tsx    # /gamesimulator -> gamesimulator
│       ├── teamformation.tsx   # /teamformation -> teamformation
│       ├── teamformation/
│       │   ├── create.tsx      # /teamformation/create -> create
│       │   └── edit/
│       │       └── [teamId].tsx  # /teamformation/edit/:id -> edit
│       ├── import.tsx          # /teamformation/import -> import
│       ├── dashboard.tsx       # /dashboard -> dashboard
│       ├── groundcontrol.tsx   # /groundcontrol -> groundcontrol
│       └── adminpanel.tsx      # /adminpanel -> adminpanel
├── contributors.tsx             # /contributors -> contributors
├── callback/
│   └── github.tsx              # /callback/github -> github
├── sicpjs/
│   └── [section].tsx          # /sicpjs/:section -> sicpjs
├── features.tsx                 # /features -> features
└── notFound.tsx                 # 404 -> notFound
```

## Implementation Steps

1. **Create `src/new_routes/` directory structure**
2. **Move top-level routes**: Move and rename `login.tsx`, `nus_login.tsx`, `welcome.tsx`, etc.
3. **Move nested login routes**: `login/callback.tsx`, `login/vscode_callback.tsx`
4. **Move playground/mission-control**: With dynamic params
5. **Move academy routes**: `courses/[courseId].tsx` and sub-routes
6. **Move leaderboard**: `leaderboard/overall.tsx`, `leaderboard/contests/...`
7. **Move teamformation**: `teamformation.tsx`, `teamformation/create.tsx`, etc.
8. **Update routerConfig imports**: Point to new file locations
9. **Fix all internal imports**: Within `src/new_routes/` and across the codebase
10. **Delete old files**: Remove originals after successful migration
