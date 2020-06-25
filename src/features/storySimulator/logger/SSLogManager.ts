import { ICheckpointLogger } from './SSLogManagerTypes';

export default class SSLogManager {
  public printDetailMap(checkpointLoggers: ICheckpointLogger[]) {
    console.log(
      checkpointLoggers
        .map(checkpointLogger => {
          const txt = checkpointLogger.checkpointTxtLog();
          return txt ? `<<${checkpointLogger.checkpointTitle}>>\n\n` + txt : '';
        })
        .join('\n\n')
    );
  }
}
