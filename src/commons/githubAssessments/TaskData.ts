import { Testcase } from '../assessment/AssessmentTypes';

/**
 * Represents a single task for a mission hosted in a GitHub repository.
 */
type TaskData = {
  taskDescription: string;
  starterCode: string;
  savedCode: string;
  testPrepend: string;
  testCases: Testcase[];
};

export default TaskData;
