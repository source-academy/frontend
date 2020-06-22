import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { prettifyDeadline } from 'src/pages/academy/achievements/subcomponents/utils/AchievementDeadline';

// A Node item encapsulates all important information of an achievement item
class Node {
  achievement: AchievementItem;
  id: number;
  furthestDeadline?: Date;
  isTask: boolean;
  totalExp?: number;
  children: Set<number>; // immediate prerequisite
  descendant: Set<number>; // all descendant prerequisites

  constructor(achievement: AchievementItem) {
    this.achievement = achievement;
    this.id = achievement.id;
    this.furthestDeadline = achievement.deadline;
    this.isTask = achievement.isTask;
    this.totalExp = achievement.exp;
    this.children = new Set(achievement.prerequisiteIDs);
    this.descendant = new Set(achievement.prerequisiteIDs);
  }
}

class Inferencer {
  private nodeList: Node[];

  constructor(achievementDict: { [id: number]: AchievementItem }) {
    this.nodeList = this.generateNodeList(achievementDict);
    this.processNodeList();
  }

  public logInfo() {
    this.nodeList.forEach(node =>
      console.log(
        node.id,
        node.achievement.title,
        prettifyDeadline(node.furthestDeadline),
        node.totalExp,
        '\nisTask:',
        node.isTask,
        '\nchildren:',
        node.children,
        '\ndescendants:',
        node.descendant
      )
    );
    console.log('ಠ_ಠ hmm...u should only see me once');
  }

  public getFurthestDeadline(achievementId: number) {
    return this.nodeList[achievementId].furthestDeadline;
  }

  public getTotalExp(achievementId: number) {
    return this.nodeList[achievementId].totalExp;
  }

  public isImmediateChild(achievementId: number, childId: number) {
    return this.nodeList[achievementId].children.has(childId);
  }

  public isDescendant(achievementId: number, childId: number) {
    return this.nodeList[achievementId].descendant.has(childId);
  }

  public getImmediateChild(achievementId: number) {
    return this.nodeList[achievementId].children;
  }

  public getDescendant(achievementId: number) {
    return this.nodeList[achievementId].descendant;
  }

  public getNonTaskAchievementsItems() {
    return this.nodeList.filter(node => !node.isTask).map(node => node.achievement);
  }

  public getAchievementItems() {
    return this.nodeList.filter(node => node.isTask);
  }

  private generateNodeList(achievementDict: { [id: number]: AchievementItem }) {
    const nodeList: Node[] = [];

    Object.values(achievementDict).forEach(
      achievement => (nodeList[achievement.id] = new Node(achievement))
    );
    return nodeList;
  }

  private processNodeList() {
    this.nodeList.forEach(node => this.generateDescendant(node));
    this.nodeList.forEach(node => this.generateFurthestDeadline(node));
    this.nodeList.forEach(node => this.generateTotalExp(node));
  }

  // Recursively append grandchildren's id to children, O(N) operation
  private generateDescendant(node: Node) {
    for (const child of node.descendant) {
      if (child === node.id) {
        console.log('Circular dependency detected for Achievement', child);
      }
      for (const grandchild of this.nodeList[child].descendant) {
        // Newly added grandchild is appended to the back of the set.
        node.descendant.add(grandchild);
        // Hence the great grandchildren will be added when the iterator reaches there
      }
    }
  }

  // Set the node's furthest deadline by comparing with all descendants' deadlines
  private generateFurthestDeadline(node: Node) {
    // Comparator of two deadlines
    const compareDeadlines = (
      furthestDeadline: Date | undefined,
      currentDeadline: Date | undefined
    ) => {
      if (currentDeadline === undefined) {
        return furthestDeadline;
      } else if (furthestDeadline === undefined) {
        return currentDeadline;
      } else {
        return furthestDeadline >= currentDeadline ? furthestDeadline : currentDeadline;
      }
    };

    // Temporary array of all descendants' deadlines
    const descendantDeadlines = [];
    for (const child of node.descendant) {
      const childDeadline = this.nodeList[child].achievement.deadline;
      descendantDeadlines.push(childDeadline);
    }

    // Reduces the temporary array to a single Date value
    node.furthestDeadline = descendantDeadlines.reduce(compareDeadlines, node.furthestDeadline);
  }

  // Set the node's total EXP by combining all descendants' EXP
  private generateTotalExp(node: Node) {
    // Sum of two EXP
    const combineExps = (accumulateExp: number | undefined, currentExp: number | undefined) => {
      if (currentExp === undefined) {
        return accumulateExp;
      } else if (accumulateExp === undefined) {
        return currentExp;
      } else {
        return accumulateExp + currentExp;
      }
    };

    // Temporary array of all descendants' exps
    const descendantExps = [];
    for (const child of node.descendant) {
      const childExp = this.nodeList[child].achievement.exp;
      descendantExps.push(childExp);
    }

    // Reduces the temporary array to a single number value
    node.totalExp = descendantExps.reduce(combineExps, node.totalExp);
  }
}

export default Inferencer;
