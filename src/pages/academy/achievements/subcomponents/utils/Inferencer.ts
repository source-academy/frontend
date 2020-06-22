import {
  AchievementItem,
  AchievementModalItem,
  FilterStatus,
  AchievementStatus
} from 'src/commons/achievements/AchievementTypes';
import { prettifyDeadline } from 'src/pages/academy/achievements/subcomponents/utils/AchievementDeadline';

// A Node item encapsulates all important information of an achievement item
class Node {
  achievement: AchievementItem;
  id: number;
  totalExp: number;
  furthestDeadline?: Date;
  children: Set<number>; // immediate prerequisite
  descendant: Set<number>; // all descendant prerequisites
  modal?: AchievementModalItem;

  constructor(achievement: AchievementItem) {
    this.achievement = achievement;
    this.id = achievement.id;
    this.totalExp = achievement.exp;
    this.furthestDeadline = achievement.deadline;
    this.children = new Set(achievement.prerequisiteIds);
    this.descendant = new Set(achievement.prerequisiteIds);
    this.modal = achievement.modal;
  }
}

class Inferencer {
  private nodeList: Node[];

  constructor(achievementData: AchievementItem[]) {
    this.nodeList = this.generateNodeList(achievementData);
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

  public getImmediateChildren(achievementId: number) {
    return this.nodeList[achievementId].children;
  }

  public listImmediateChildren(achievementId: number) {
    return [...this.getImmediateChildren(achievementId)];
  }

  public isDescendant(achievementId: number, childId: number) {
    return this.nodeList[achievementId].descendant.has(childId);
  }

  public getDescendants(achievementId: number) {
    return this.nodeList[achievementId].descendant;
  }

  public getNonTaskAchievementsItems() {
    return this.nodeList.filter(node => !node.achievement.isTask).map(node => node.achievement);
  }

  public getAchievementItems() {
    // to be removed
    return this.nodeList.filter(node => node.achievement.isTask);
  }

  public getAchievementItem(achievementId: number) {
    return this.nodeList[achievementId].achievement;
  }

  public getFilterCount(filterStatus: FilterStatus) {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return this.nodeList.length;
      case FilterStatus.ACTIVE:
        return this.nodeList.filter(node => node.achievement.status === AchievementStatus.ACTIVE)
          .length;
      case FilterStatus.COMPLETED:
        return this.nodeList.filter(node => node.achievement.status === AchievementStatus.COMPLETED)
          .length;
      default:
        return 0;
    }
  }

  public getTaskIds() {
    return this.nodeList.filter(node => node.achievement.isTask).map(node => node.id);
  }

  private generateNodeList(achievementData: AchievementItem[]) {
    const nodeList: Node[] = [];

    achievementData.forEach(achievement => (nodeList[achievement.id] = new Node(achievement)));
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
    const combineExps = (accumulateExp: number, currentExp: number) => {
      return accumulateExp + currentExp;
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
