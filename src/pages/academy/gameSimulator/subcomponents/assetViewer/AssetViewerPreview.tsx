import { memo } from 'react';
import { Constants } from 'src/features/game/commons/CommonConstants';
import { toS3Path } from 'src/features/game/utils/GameUtils';

import { AssetProps } from './AssetViewerTypes';

/**
 * This component renders the asset corresponding to the given asset path.
 *
 * @assetPath - The path of the asset to render / preview.
 */
const AssetViewerPreview = memo(({ assetPath }: AssetProps) => {
  const displayAssetPath = assetPath || Constants.defaultAssetPath;
  return (
    <img
      alt="asset"
      crossOrigin={'anonymous'}
      src={toS3Path(displayAssetPath, !!assetPath)}
      width="150px"
      onError={e => {
        (e.target as any).onerror = null;
        (e.target as any).src = toS3Path(Constants.defaultAssetPath, false);
      }}
    />
  );
});

export default AssetViewerPreview;
