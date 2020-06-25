import {
  AchievementItem,
  AchievementModalItem,
  FilterStatus,
  AchievementStatus
} from 'src/commons/achievements/AchievementTypes';

// A Node item encapsulates all important information of an achievement item
class Node {
  achievement: AchievementItem;
  id: number;
  status: AchievementStatus;
  totalExp: number;
  furthestDeadline?: Date;
  collectiveProgress: number;
  children: Set<number>; // immediate prerequisite
  descendant: Set<number>; // all descendant prerequisites
  modal: AchievementModalItem;

  constructor(achievement: AchievementItem) {
    const {
      id,
      exp,
      deadline,
      completionGoal,
      completionProgress,
      prerequisiteIds,
      modal
    } = achievement;

    this.achievement = achievement;
    this.id = id;
    this.status = this.generateStatus(deadline, completionGoal, completionProgress);
    this.totalExp = exp;
    this.furthestDeadline = deadline;
    this.collectiveProgress = Math.min(completionProgress / completionGoal, 1);
    this.children = new Set(prerequisiteIds);
    this.descendant = new Set(prerequisiteIds);
    this.modal = modal;
  }

  private generateStatus(
    deadline: Date | undefined,
    completionGoal: number,
    completionProgress: number
  ) {
    if (completionProgress >= completionGoal) {
      return AchievementStatus.COMPLETED;
    } else if (deadline !== undefined && deadline.getTime() > Date.now()) {
      return AchievementStatus.EXPIRED;
    } else {
      return AchievementStatus.ACTIVE;
    }
  }
}

class Inferencer {
  private nodeList: Node[];

  constructor(achievementData: AchievementItem[]) {
    this.nodeList = this.generateNodeList(achievementData);
    this.processNodeList();
    console.log('Generated Inferencer');
    this.logInfo();
  }

  public logInfo() {
    this.nodeList.forEach(node => console.log(node.id, node.achievement.title));
    console.log('ಠ_ಠ hmm...u should only see me once');
  }

  public getAchievementItem(id: number) {
    return this.nodeList[id].achievement;
  }

  public addAchievement(achievement: AchievementItem) {
    const newId = this.nodeList.length;
    achievement.id = newId;
    this.nodeList[newId] = new Node(achievement);
    this.processNodeList();
  }

  public editAchievements(achievement: AchievementItem) {
    this.nodeList[achievement.id] = new Node(achievement);
    this.processNodeList();
  }

  public removeAchievement(id: number) {
    // implement remove
  }

  public listIds() {
    return this.nodeList.map(node => node.id);
  }

  public listTaskIds() {
    return this.nodeList.filter(node => node.achievement.isTask).map(node => node.id);
  }

  public getStatus(id: number) {
    return this.nodeList[id].status;
  }

  public getTotalExp(id: number) {
    return this.nodeList[id].totalExp;
  }

  public getFurthestDeadline(id: number) {
    return this.nodeList[id].furthestDeadline;
  }

  public getCollectiveProgress(id: number) {
    return this.nodeList[id].collectiveProgress;
  }

  public isImmediateChild(id: number, childId: number) {
    return this.nodeList[id].children.has(childId);
  }

  public getImmediateChildren(id: number) {
    return this.nodeList[id].children;
  }

  public listImmediateChildren(id: number) {
    return [...this.getImmediateChildren(id)];
  }

  public isDescendant(id: number, childId: number) {
    return this.nodeList[id].descendant.has(childId);
  }

  public getDescendants(id: number) {
    return this.nodeList[id].descendant;
  }

  public listDescendants(id: number) {
    return [...this.getDescendants(id)];
  }

  public getModalItem(id: number) {
    return id < 0 ? undefined : this.nodeList[id].modal;
  }

  public getFilterCount(filterStatus: FilterStatus) {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return this.nodeList.length;
      case FilterStatus.ACTIVE:
        return this.nodeList.filter(node => node.status === AchievementStatus.ACTIVE).length;
      case FilterStatus.COMPLETED:
        return this.nodeList.filter(node => node.status === AchievementStatus.COMPLETED).length;
      default:
        return 0;
    }
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
    this.nodeList.forEach(node => this.generateCollectiveProgress(node));
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

  // Set the node's collective progress by combining all descendants' progress
  private generateCollectiveProgress(node: Node) {
    if (node.children.size === 0) {
      // No prerequisites, just display the achievement progress
      return;
    }

    // Node has prerequisites, display aggregated descendants progress

    // Combiner of progress
    const collateProgress = (accumulateProgress: number, currentProgress: number) => {
      return accumulateProgress + currentProgress;
    };

    const descendantProgress = [];
    for (const child of node.descendant) {
      const { completionGoal, completionProgress } = this.nodeList[child].achievement;
      const childProgress = Math.min(completionProgress / completionGoal, 1);
      descendantProgress.push(childProgress);
    }
    const normalize = descendantProgress.length;

    // Reduces the temporary array to a single number value
    node.collectiveProgress = descendantProgress.reduce(collateProgress, 0) / normalize;
  }
}

export default Inferencer;
