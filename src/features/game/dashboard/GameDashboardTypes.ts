export enum DashboardPage {
  Log = 'Log',
  Tasks = 'Tasks',
  Collectibles = 'Collectibles',
  Achievements = 'Achievements'
}

export interface DashboardPageManager {
  createUIContainer: () => Phaser.GameObjects.Container;
}
