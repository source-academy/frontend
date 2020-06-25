export const loggableStyle = {
  fontFamily: 'Helvetica',
  fontSize: '20px',
  fill: '#abd4c6'
};

export interface IScreenLoggable {
  x: number;
  y: number;
}

export interface ICheckpointLogger {
  checkpointTitle: string;
  checkpointTxtLog: () => string | undefined;
}
