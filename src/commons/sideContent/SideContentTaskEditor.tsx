import React from 'react';

import { SideContentMarkdownEditor } from './SideContentMarkdownEditor';

export type SideContentTaskEditorProps = {
  currentTaskNumber: number;
  taskDescriptions: any[];
  setTaskDescriptions: (newList: any[]) => void;
};

export const SideContentTaskEditor: React.FC<SideContentTaskEditorProps> = props => {
  const taskIndex = props.currentTaskNumber - 1;
  const taskDescriptions = props.taskDescriptions;
  const setTaskDescriptions = props.setTaskDescriptions;

  const indexOutOfRange =
    taskIndex < 0 || taskIndex >= taskDescriptions.length || taskDescriptions.length === 0;

  const taskBriefing = indexOutOfRange
    ? 'Welcome to Mission Mode! This is where the Task Briefing for each question will appear!'
    : taskDescriptions[taskIndex];

  const taskBriefingSetter = React.useCallback(
    (newDescription: string) => {

      if (indexOutOfRange) {
        return;
      }

      const newTaskDescriptions = taskDescriptions.map(desc => desc);
      newTaskDescriptions[taskIndex] = newDescription;
      setTaskDescriptions(newTaskDescriptions);
    },
    [setTaskDescriptions, taskDescriptions, taskIndex, indexOutOfRange]
  );

  return (
    <div>
      <SideContentMarkdownEditor content={taskBriefing} setContent={taskBriefingSetter} />
    </div>
  );
};
