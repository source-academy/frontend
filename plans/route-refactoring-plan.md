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
│       └── game.tsx                # /courses/:courseId/game
├── callback/
│   └── github.tsx                  # /callback/github
└── sicpjs/
    ├── _layout.tsx
    └── [section].tsx                # /sicpjs/:section
```

## Remaining Tasks

### 1. Migrate Grading → `src/new_routes/courses/[courseId]/grading/[submissionId].tsx`

- **Source**: `src/pages/academy/grading/Grading.tsx`
- **File rename**: `Grading.tsx` → `grading.tsx`
- **Export**: `export const Component = Grading;`

### 2. Migrate GameSimulator → `src/new_routes/courses/[courseId]/gamesimulator.tsx`

- **Source**: `src/pages/academy/gameSimulator/GameSimulator.tsx`
- **File rename**: `GameSimulator.tsx` → `gamesimulator.tsx`
- **Export**: `export const Component = GameSimulator;`

### 3. Migrate TeamFormation → `src/new_routes/courses/[courseId]/teamformation.tsx`

- **Source**: `src/pages/academy/teamFormation/TeamFormation.tsx`
- **File rename**: `TeamFormation.tsx` → `teamformation.tsx`
- **Export**: `export const Component = TeamFormation;`

### 4. Migrate TeamFormationForm → Two routes

**Create** → `src/new_routes/courses/[courseId]/teamformation/create.tsx`

- **Source**: `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` (create mode)
- **File rename**: `TeamFormationForm.tsx` → `create.tsx`
- **Export**: `export const Component = TeamFormationForm;`

**Edit** → `src/new_routes/courses/[courseId]/teamformation/edit/[teamId].tsx`

- **Source**: `src/pages/academy/teamFormation/subcomponents/TeamFormationForm.tsx` (edit mode)
- **File rename**: `TeamFormationForm.tsx` → `edit/[teamId].tsx`
- **Export**: `export const Component = TeamFormationForm;`

### 5. Migrate TeamFormationImport → `src/new_routes/courses/[courseId]/teamformation/import.tsx`

- **Source**: `src/pages/academy/teamFormation/subcomponents/TeamFormationImport.tsx`
- **File rename**: `TeamFormationImport.tsx` → `import.tsx`
- **Export**: `export const Component = TeamFormationImport;`

### 6. Migrate Dashboard → `src/new_routes/courses/[courseId]/dashboard.tsx`

- **Source**: `src/pages/academy/dashboard/Dashboard.tsx`
- **File rename**: `Dashboard.tsx` → `dashboard.tsx`
- **Export**: `export const Component = Dashboard;`

### 7. Migrate GroundControl → `src/new_routes/courses/[courseId]/groundcontrol.tsx`

- **Source**: `src/pages/academy/groundControl/GroundControl.tsx`
- **File rename**: `GroundControl.tsx` → `groundcontrol.tsx`
- **Export**: `export const Component = GroundControl;`

### 8. Migrate AdminPanel → `src/new_routes/courses/[courseId]/adminpanel.tsx`

- **Source**: `src/pages/academy/adminPanel/AdminPanel.tsx`
- **File rename**: `AdminPanel.tsx` → `adminpanel.tsx`
- **Export**: `export const Component = AdminPanel;`

### 9. Migrate OverallLeaderboard → `src/new_routes/courses/[courseId]/leaderboard/overall.tsx`

- **Source**: `src/pages/leaderboard/subcomponents/OverallLeaderboard.tsx`
- **File rename**: `OverallLeaderboard.tsx` → `overall.tsx`
- **Export**: `export const Component = OverallLeaderboard;`

### 10. Migrate ContestLeaderboardWrapper → `src/new_routes/courses/[courseId]/leaderboard/contests/[contestId]/[leaderboardType].tsx`

- **Source**: `src/pages/leaderboard/subcomponents/ContestLeaderboardWrapper.tsx`
- **File rename**: `ContestLeaderboardWrapper.tsx` → `contest_leaderboard.tsx`
- **Export**: `export const Component = ContestLeaderboardWrapper;`

## Component Export Style (Required)

All migrated components MUST follow this pattern (file name changes, component name stays the same):

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

After migration, update `src/pages/academy/academyRoutes.ts` to point to new locations:

```typescript
// Before
const Grading = () => import('./grading/Grading');

// After
const Grading = () => import('../../new_routes/courses/[courseId]/grading/[submissionId]');
```

## Execution Order

1. Create directory structure under `src/new_routes/courses/[courseId]/`
2. Migrate Grading
3. Migrate GameSimulator
4. Migrate TeamFormation and its subcomponents
5. Migrate Dashboard
6. Migrate GroundControl
7. Migrate AdminPanel
8. Migrate leaderboard components
9. Update academyRoutes.ts imports
10. Delete old files after verification
