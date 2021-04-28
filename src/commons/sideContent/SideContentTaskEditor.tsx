import React from 'react';

import TaskData from '../missionEditor/TaskData';
import { SideContentMarkdownEditor } from './SideContentMarkdownEditor';

export type SideContentTaskEditorProps = {
  currentTaskNumber: number;
  tasks: TaskData[];
};

export const SideContentTaskEditor: React.FC<SideContentTaskEditorProps> = props => {
  const taskIndex = props.currentTaskNumber - 1;
  const useDefaultDescription =
    taskIndex < 0 || taskIndex >= props.tasks.length || props.tasks.length === 0;

  const taskBriefing = useDefaultDescription
    ? 'Welcome to Mission Mode! This is where the Task Briefing for each question will appear!'
    : props.tasks[props.currentTaskNumber - 1].taskDescription;

  return (
    <div>
      <SideContentMarkdownEditor content={taskBriefing} />
    </div>
  );
};
