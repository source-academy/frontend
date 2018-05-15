export default {}

export type UPDATE_PLAYGROUND_CODE = 'UPDATE_PLAYGROUND_CODE';
export const  UPDATE_PLAYGROUND_CODE: UPDATE_PLAYGROUND_CODE = 'UPDATE_PLAYGROUND_CODE';

export interface IUpdatePlaygroundCodeAction {
    type: UPDATE_PLAYGROUND_CODE
    playgroundCode: string
  };

export function updatePlaygroundCode(newCode: string): IUpdatePlaygroundCodeAction {
    return {
      type: UPDATE_PLAYGROUND_CODE,
      playgroundCode: newCode
    };
  };