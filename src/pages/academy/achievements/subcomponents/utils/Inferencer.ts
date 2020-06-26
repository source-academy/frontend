import {
  AchievementItem,
  AchievementModalItem,
  FilterStatus,
  AchievementStatus
} from '../../../../../commons/achievements/AchievementTypes';

// A Node item encapsulates all important information of an achievement item
class Node {
  achievement: AchievementItem;
  dataIdx: number; // achievementData[dataIdx] = achievement
  status: AchievementStatus;
  totalExp: number;
  furthestDeadline?: Date;
  collectiveProgress: number;
  children: Set<number>; // immediate prerequisite
  descendant: Set<number>; // all descendant prerequisites including immediate prerequisites
  modal: AchievementModalItem;

  constructor(achievement: AchievementItem, dataIdx: number) {
    const {
      exp,
      deadline,
      completionGoal,
      completionProgress,
      prerequisiteIds,
      modal
    } = achievement;

    this.achievement = achievement;
    this.dataIdx = dataIdx;
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
  private achievementData: AchievementItem[] = [];
  private nodeList: Map<number, Node> = new Map(); // key = achievement id

  constructor(achievementData: AchievementItem[]) {
    this.achievementData = achievementData;
    this.processData();
  }

  public doesAchievementExist(id: number) {
    return this.nodeList.get(id) !== undefined;
  }

  public getNextID(tasks: number[]) {
    if (tasks.length === 0) {
      return 0;
    } else {
      for (let i = 0; i < tasks.length; i++) {
        if (this.doesAchievementExist(tasks[i])) {
          return tasks[i];
        }
      }

      return 0;
    }
  }

  public getAchievementData() {
    return this.achievementData;
  }

  public getAchievementItem(id: number) {
    // asserts: the achievement id already exist in nodeList
    return this.nodeList.get(id)!.achievement;
  }

  public addAchievement(achievement: AchievementItem) {
    // first, generate a new unique id
    const len = this.achievementData.length;
    const newId = len > 0 ? this.achievementData[len - 1].id + 1 : 0;

    // then assign the new unique id by overwriting the achievement item
    // and append it to achievementData
    achievement.id = newId;
    this.achievementData.push(achievement);

    // finally, reconstruct the nodeList
    this.processData();
  }

  public editAchievement(achievement: AchievementItem) {
    // directly modify the achievement element in achievementData
    // asserts: the achievement id already exists in nodeList
    const idx = this.nodeList.get(achievement.id)!.dataIdx;
    this.achievementData[idx] = achievement;

    // then, reconstruct the nodeList
    this.processData();
  }

  public removeAchievement(id: number) {
    const hasChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.reduce((acc, child) => acc || child === id, false);

    const removeChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.filter(child => child !== id);

    // create a copy of achievementData that:
    // 1. does not contain the removed achievement
    // 2. does not contain reference of the removed achievement in other achievement's prerequisite
    const newAchievementData: AchievementItem[] = [];

    this.achievementData.reduce((acc, parent) => {
      if (parent.id === id) {
        return acc; // removed item not included in the new achievementData
      } else if (hasChild(parent)) {
        parent.prerequisiteIds = removeChild(parent); // reference of the removed item is filtered out
      }
      acc.push(parent);
      return acc;
    }, newAchievementData);

    this.achievementData = newAchievementData;

    // finally, reconstruct the nodeList
    this.processData();
  }

  public listIds() {
    return this.achievementData.map(achievement => achievement.id);
  }

  public listTaskIds() {
    return this.achievementData.reduce((acc, achievement) => {
      if (achievement.isTask) {
        acc.push(achievement.id);
      }
      return acc;
    }, [] as number[]);
  }

  public listNonTaskIds() {
    return this.achievementData.reduce((acc, achievement) => {
      if (!achievement.isTask) {
        acc.push(achievement.id);
      }
      return acc;
    }, [] as number[]);
  }

  public getStatus(id: number) {
    return this.nodeList.get(id)!.status;
  }

  public getTotalExp(id: number) {
    return this.nodeList.get(id)!.totalExp;
  }

  public getFurthestDeadline(id: number) {
    return this.nodeList.get(id)!.furthestDeadline;
  }

  public getCollectiveProgress(id: number) {
    return this.nodeList.get(id)!.collectiveProgress;
  }

  public isImmediateChild(id: number, childId: number) {
    return this.nodeList.get(id)!.children.has(childId);
  }

  public getImmediateChildren(id: number) {
    return this.nodeList.get(id)!.children;
  }

  public listImmediateChildren(id: number) {
    return [...this.getImmediateChildren(id)];
  }

  public isDescendant(id: number, childId: number) {
    return this.nodeList.get(id)!.descendant.has(childId);
  }

  public getDescendants(id: number) {
    return this.nodeList.get(id)!.descendant;
  }

  public listDescendants(id: number) {
    return [...this.getDescendants(id)];
  }

  public listAvailablePrerequisites(id: number) {
    return this.listIds().filter(
      target => target !== id && !this.isDescendant(id, target) && !this.isDescendant(target, id)
    );
  }

  public getModalItem(id: number) {
    return id < 0 ? undefined : this.nodeList.get(id)!.modal;
  }

  public getFilterCount(filterStatus: FilterStatus) {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return this.nodeList.size;
      case FilterStatus.ACTIVE:
        return [...this.nodeList.values()].filter(node => node.status === AchievementStatus.ACTIVE)
          .length;
      case FilterStatus.COMPLETED:
        return [...this.nodeList.values()].filter(
          node => node.status === AchievementStatus.COMPLETED
        ).length;
      default:
        return 0;
    }
  }

  private processData() {
    this.constructNodeList();
    this.nodeList.forEach(node => {
      this.generateDescendant(node);
      this.generateFurthestDeadline(node);
      this.generateTotalExp(node);
      this.generateCollectiveProgress(node);
    });
    this.dataCheck();
  }

  // Verify the key-value mappings of achievementData and nodeList are correct
  private dataCheck() {
    for (const [id, node] of this.nodeList) {
      if (id !== node.achievement.id) {
        console.log('Unmatched nodeList key-achievementId mapping', node);
      } else if (node.achievement !== this.achievementData[node.dataIdx]) {
        console.log(
          'Unmatched achievement items in nodeList and achievementData\n',
          'Data\n',
          this.achievementData[id],
          '\nNode\n',
          node
        );
      }
    }
    console.log('Processed data with no data integrity warning');
  }

  private constructNodeList() {
    this.nodeList = new Map();
    for (let idx = 0; idx < this.achievementData.length; idx++) {
      const achievement = this.achievementData[idx];
      this.nodeList.set(achievement.id, new Node(achievement, idx));
    }
  }

  // Recursively append grandchildren's id to children, O(N) operation
  private generateDescendant(node: Node) {
    for (const childId of node.descendant) {
      if (childId === node.achievement.id) {
        console.error('Circular dependency detected');
      }
      for (const grandchildId of this.nodeList.get(childId)!.descendant) {
        // Newly added grandchild is appended to the back of the set.
        node.descendant.add(grandchildId);
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
    for (const childId of node.descendant) {
      const childDeadline = this.nodeList.get(childId)!.achievement.deadline;
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
    for (const childId of node.descendant) {
      const childExp = this.nodeList.get(childId)!.achievement.exp;
      descendantExps.push(childExp);
    }

    // Reduces the temporary array to a single number value
    node.totalExp = descendantExps.reduce(combineExps, node.totalExp);
  }

  // Set the node's collective progress by combining all descendants' progress
  private generateCollectiveProgress(node: Node) {
    // If no prerequisites, just display the achievement progress
    // Otherwise, display aggregated descendants progress
    if (node.children.size === 0) {
      return;
    }

    // Combiner of progress
    const collateProgress = (accumulateProgress: number, currentProgress: number) => {
      return accumulateProgress + currentProgress;
    };

    // Temporary array of all descendants' progress
    const descendantProgress = [];
    for (const childId of node.descendant) {
      const { completionGoal, completionProgress } = this.nodeList.get(childId)!.achievement;
      const childProgress = Math.min(completionProgress / completionGoal, 1);
      descendantProgress.push(childProgress);
    }
    const normalize = descendantProgress.length;

    // Reduces the temporary array to a single number value
    node.collectiveProgress = descendantProgress.reduce(collateProgress, 0) / normalize;
  }
}

export default Inferencer;
