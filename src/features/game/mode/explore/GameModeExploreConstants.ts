import { toS3Path } from '../../utils/GameUtils';

const ExploreModeConstants = {
  normal: `url(${toS3Path('/ui/magnifying.png', false)}), pointer`,
  hover: `url(${toS3Path('/ui/magnifying_trigg.png', false)}), pointer`,
  checked: `url(${toS3Path('/ui/magnifying_check.png', false)}), pointer`,
  move: `url(${toS3Path('/ui/footprint.png', false)}) 32 32, pointer`,
  chat: `url(${toS3Path('/ui/chat.png', false)}) 32 32, pointer`
};

export default ExploreModeConstants;
