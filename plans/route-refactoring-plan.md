# Route Refactoring Plan: `src/new_routes/`

## Objective

Continue migrating remaining page files from `src/pages/` and `src/commons/` to `src/new_routes/` following file-based URL conventions. Update imports in `academyRoutes.ts` and clean up old files.

## Current State (Source of Truth)

### Already Migrated ✅

| File | Component | Location |
|------|-----------|----------|
| `src/pages/login/LoginPage.tsx` | `LoginPage` | `src/new_routes/login/index.tsx` |
| `src/pages/login/LoginCallback.tsx` | `LoginCallback` | `src/new_routes/login/callback.tsx` |
| `src/pages/login/LoginVscodeCallback.tsx` | `LoginVscodeCallback` | `src/new_routes/login/vscode_callback.tsx` |
| `src/pages/welcome/Welcome.tsx` | `Welcome` | `src/new_routes/welcome.tsx` |
| `src/pages/playground/Playground.tsx` | `Playground` | `src/pages/playground/Playground.tsx` (still in pages) |
| `src/pages/missionControl/MissionControl.tsx` | `MissionControl` | `src/new_routes/mission-control/[assessmentId]/[questionId].tsx` |
| `src/pages/contributors/Contributors.tsx` | `Contributors` | `src/new_routes/contributors.tsx` |
| `src/pages/githubCallback/GitHubCallback.tsx` | `GitHubCallback` | `src/new_routes/callback/github.tsx` |
| `src/pages/sicp/Sicp.tsx` | `Sicp` | `src/new_routes/sicpjs/[section].tsx` |
| `src/pages/featureFlags/FeatureFlags.tsx` | `FeatureFlags` | `src/new_routes/features.tsx` |
| `src/pages/notFound/NotFound.tsx` | `NotFound` | `src/new_routes/not-found.tsx` |
| `src/pages/academy/Academy.tsx` | `Academy` | `src/new_routes/courses/[courseId]/_layout.tsx` |
| `src/pages/academy/game/Game.tsx` | `Game` | `src/new_routes/courses/[courseId]/game.tsx` |
| `src/pages/academy/grading/Grading.tsx` | `Grading` | `src/new_routes/courses/[courseId]/grading/[submissionId].tsx` |
| `src/pages/academy/gameSimulator/GameSimulator.tsx` | `GameSimulator` | `src/new_routes/courses/[courseId]/gamesimulator.tsx` |
| `src/pages/academy/teamFormation/TeamFormation.tsx` | `TeamFormation` | `src/new_routes/courses/[courseId]/teamformation.tsx` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` | `TeamFormationForm` (create) | `src/new_routes/courses/[courseId]/teamformation/create.tsx` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` | `TeamFormationForm` (edit) | `src/new_routes/courses/[courseId]/teamformation/edit/[teamId].tsx` |
| `src/pages/academy/teamFormation/subcomponents/TeamFormationImport.tsx` | `TeamFormationImport` | `src/new_routes/courses/[courseId]/teamformation/import.tsx` |
| `src/pages/academy/dashboard/Dashboard.tsx` | `Dashboard` | `src/new_routes/courses/[courseId]/dashboard.tsx` |
| `src/pages/academy/groundControl/GroundControl.tsx` | `GroundControl` | `src/new_routes/courses/[courseId]/groundcontrol.tsx` |
| `src/pages/academy/adminPanel/AdminPanel.tsx` | `AdminPanel` | `src/new_routes/courses/[courseId]/adminpanel.tsx` |
| `src/pages/leaderboard/subcomponents/OverallLeaderboard.tsx` | `OverallLeaderboard` | `src/new_routes/courses/[courseId]/leaderboard/overall.tsx` |
| `src/pages/leaderboard/subcomponents/ContestLeaderboardWrapper.tsx` | `ContestLeaderboardWrapper` | `src/new_routes/courses/[courseId]/leaderboard/contests/[contestId]/[leaderboardType].tsx` |

### Current Directory Structure

```
src/new_routes/
├── _layout.tsx                    # Root layout
├── _layout.test.tsx
├── contributors.tsx
├── features.tsx
├── not-found.tsx
├── nus_login.tsx
├── welcome.tsx
├── login/
│   ├── index.tsx                   # /login
│   ├── callback.tsx                 # /login/callback
│   └── vscode_callback.tsx          # /login/vscode_callback
├── mission-control/
│   └── [assessmentId]/
│       └── [questionId].tsx         # /mission-control/:assessmentId/:questionId
├── courses/
│   └── [courseId]/
│       ├── _layout.tsx             # Course selecting layout
│       ├── game.tsx                # /courses/:courseId/game
│       ├── grading/
│       │   └── [submissionId].tsx   # /courses/:courseId/grading/:submissionId
│       ├── gamesimulator.tsx        # /courses/:courseId/gamesimulator
│       ├── teamformation.tsx       # /courses/:courseId/teamformation
│       ├── teamformation/
│       │   ├── create.tsx           # /courses/:courseId/teamformation/create
│       │   ├── edit/
│       │   │   └── [teamId].tsx     # /courses/:courseId/teamformation/edit/:teamId
│       │   └── import.tsx           # /courses/:courseId/teamformation/import
│       ├── dashboard.tsx            # /courses/:courseId/dashboard
│       ├── groundcontrol.tsx        # /courses/:courseId/groundcontrol
│       ├── adminpanel.tsx           # /courses/:courseId/adminpanel
│       └── leaderboard/
│           ├── overall.tsx           # /courses/:courseId/leaderboard/overall
│           └── contests/
│               └── [contestId]/
│                   └── [leaderboardType].tsx  # /courses/:courseId/leaderboard/contests/:contestId/:leaderboardType
├── callback/
│   └── github.tsx                  # /callback/github
└── sicpjs/
    ├── _layout.tsx
    └── [section].tsx                # /sicpjs/:section
```

## Pending Tasks

All academy routes have been migrated. Remaining work:

1. **Update `academyRoutes.ts`** - Already done ✅
2. **Clean up old files** - Pending (delete migrated files from `src/pages/academy/` and `src/pages/leaderboard/`)
3. **Verify routes work** - Run the application to test

## Component Export Style (Required)

All migrated components follow this pattern (file name changes, component name stays the same):

```tsx
function Grading() {
  return <div>...</div>;
}

export const Component = Grading;
```

**Rules:**

- Use function declarations (not arrow functions)
- Use named export `Component` (not default export)
- No `React.FC` typing
- Component name stays the same (e.g., `Grading`, `TeamFormation`)
- Only the file name changes to match the URL path (e.g., `grading.tsx`, `teamformation.tsx`)

## Import Updates

`src/pages/academy/academyRoutes.ts` has been updated to point to new locations:

```typescript
const Grading = () => import('../../new_routes/courses/[courseId]/grading/[submissionId]');
const GameSimulator = () => import('../../new_routes/courses/[courseId]/gamesimulator');
const TeamFormation = () => import('../../new_routes/courses/[courseId]/teamformation');
// etc.
```

## Execution Order

1. ✅ Create directory structure under `src/new_routes/courses/[courseId]/`
2. ✅ Migrate Grading
3. ✅ Migrate GameSimulator
4. ✅ Migrate TeamFormation and its subcomponents
5. ✅ Migrate Dashboard
6. ✅ Migrate GroundControl
7. ✅ Migrate AdminPanel
8. ✅ Migrate leaderboard components
9. ✅ Update academyRoutes.ts imports
10. ⏳ Delete old files after verification
