import { WorkspaceLocation } from '../../../../commons/workspace/WorkspaceTypes';
import { SourcecastData } from '../../SourceRecorderTypes';
import { fetchSourcecastIndex, updateSourcecastIndex } from '../SourcecastActions';

const sourcecastWorkspace: WorkspaceLocation = 'sourcecast';

test('fetchSourcecastIndex generates correct action object', () => {
  const action = fetchSourcecastIndex(sourcecastWorkspace);
  expect(action).toEqual({
    type: fetchSourcecastIndex.type,
    payload: {
      workspaceLocation: sourcecastWorkspace
    }
  });
});

test('updateSourcecastIndex generates correct action object', () => {
  const sourcecastData: SourcecastData = {
    title: 'Test Title',
    description: 'Test Description',
    uid: 'uid',
    inserted_at: '2019-07-17T15:54:57',
    updated_at: '2019-07-17T15:54:57',
    playbackData: '{}',
    id: 1,
    uploader: {
      id: 2,
      name: 'Tester'
    },
    url: 'testurl.com'
  };
  const action = updateSourcecastIndex([sourcecastData], sourcecastWorkspace);
  expect(action).toEqual({
    type: updateSourcecastIndex.type,
    payload: { index: [sourcecastData], workspaceLocation: sourcecastWorkspace }
  });
});
