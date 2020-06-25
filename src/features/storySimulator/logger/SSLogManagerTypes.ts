export interface IDetailLogger {
  x: number;
  y: number;
  screenLog: () => string;
}

export interface ICheckpointLogger {
  checkpointTitle: string;
  checkpointTxtLog: () => string | undefined;
}
