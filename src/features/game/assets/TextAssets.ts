import { toS3Path } from '../utils/GameUtils';

export const toTxtPath = (path: string) => toS3Path(`/stories/${path}`, true);

const TextAssets = {
  defaultCheckpoint: { key: 'default-chap', path: toTxtPath('defaultCheckpoint.txt') },
  awardsMapping: { key: 'awards-mapping', path: toTxtPath('awardsMapping.txt') },
  roomPreviewMapping: { key: 'room-prev-mapping', path: toTxtPath('roomPreviewMapping.txt') }
};

export const MockTextAssets = {
  defaultCheckpoint: { key: 'mock-default-chap', path: '../../assets/mockDefaultCheckpoint.txt' },
  awardsMapping: { key: 'mock-awards-mapping', path: '../../assets/mockAwardsMapping.txt' },
  roomPreviewMapping: {
    key: 'mock-room-prev-mapping',
    path: '../../assets/mockRoomPreviewMapping.txt'
  }
};

export default TextAssets;
