import { toS3Path } from '../../utils/GameUtils';

const ExploreModeConstants = {
  normal: `url(${toS3Path('/ui/magnifying.png', false)}), pointer`,
  hover: `url(${toS3Path('/ui/magnifying_trigg.png', false)}), pointer`,
  checked: `url(${toS3Path('/ui/magnifying_check.png', false)}), pointer`
};

export default ExploreModeConstants;
