import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

class Node {
  id: number;
  title: string;
  deadline?: Date;
  exp?: number;

  constructor(achievement: AchievementItem) {
    this.id = achievement.id;
    this.title = achievement.title;
    this.deadline = achievement.deadline;
    this.exp = achievement.exp;
  }
}

class Inferencer {
  private prerequisiteTree: Node[];

  constructor(achievementDict: { [id: number]: AchievementItem }) {
    this.prerequisiteTree = this.generatePrerequisiteTree(achievementDict);
  }

  public getPrerequisiteTree(): Node[] {
    return this.prerequisiteTree;
  }

  public printPrerequisiteTree() {
    this.prerequisiteTree.forEach(node => console.log(node));
  }

  private generatePrerequisiteTree(achievementDict: { [id: number]: AchievementItem }) {
    return Object.values(achievementDict).map(achievement => new Node(achievement));
  }
}

export default Inferencer;
