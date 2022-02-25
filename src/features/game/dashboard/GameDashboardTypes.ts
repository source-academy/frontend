export enum DashboardPage {
  Log = 'Log',
  Tasks = 'Tasks'
}

export interface DashboardPageManager {
  createUIContainer: () => Phaser.GameObjects.Container;
}
