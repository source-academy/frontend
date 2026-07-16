import { ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import type { BadgeColor } from 'src/components/ui/badge';

const BADGE_COLORS = {
  missions: 'indigo',
  quests: 'emerald',
  paths: 'sky',

  [ProgressStatuses.autograded]: 'purple',
  [ProgressStatuses.not_attempted]: 'gray',
  [ProgressStatuses.attempting]: 'red',
  [ProgressStatuses.attempted]: 'red',

  [ProgressStatuses.submitted]: 'yellow',
  [ProgressStatuses.graded]: 'green',
  [ProgressStatuses.published]: 'blue',
} as const satisfies Record<string, BadgeColor>;

function getBadgeColorFromLabel(label: string): BadgeColor {
  const maybeKey = label.toLowerCase() as keyof typeof BADGE_COLORS;
  return BADGE_COLORS[maybeKey] ?? 'gray';
}

// For supporting tables that still use Tremor & Tanstack (e.g TeamFormationBadges since they copied the old tanstack grading code)
// TO BE REMOVED AFTER THEY MIGRATE TO BLUEPRINTJS/AGGRID
function getBadgeColorFromLabelLegacy(label: string): BadgeColor {
  return getBadgeColorFromLabel(label);
}

export { getBadgeColorFromLabel, getBadgeColorFromLabelLegacy };
