const BADGE_COLORS = {
  // assessment types
  missions: 'indigo',
  quests: 'emerald',
  paths: 'sky',

  // submission status
  submitted: 'green',
  attempting: 'yellow',
  attempted: 'red',

  // grading status
  graded: 'green',
  grading: 'yellow',
  none: 'red'
};

export function badgeColor(label: string) {
  return BADGE_COLORS[label.toLowerCase()] || 'gray';
}
