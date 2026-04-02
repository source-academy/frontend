import { toS3Path } from '../../utils/GameUtils';

const ExploreModeConstants = {
  normal: `url(${toS3Path('/ui/magnifying.png', false)}), pointer`,
  hover: `url(${toS3Path('/ui/magnifying_trigg.png', false)}), pointer`,
  checked: `url(${toS3Path('/ui/magnifying_check.png', false)}), pointer`,
  move: `url(/assets/footprint.png) 32 32, pointer`,
  chat: `url(/assets/chat.png) 32 32, pointer`
};

export default ExploreModeConstants;
