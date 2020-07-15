export interface IScreenLoggable {
  x: number;
  y: number;
}

export interface ICheckpointLoggable {
  checkpointTitle: string;
  checkpointTxtLog: () => string[];
}
