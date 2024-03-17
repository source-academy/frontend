import { memo } from 'react';
import { Constants } from 'src/features/game/commons/CommonConstants';
import { toS3Path } from 'src/features/game/utils/GameUtils';
import { AssetProps } from 'src/features/gameSimulator/GameSimulatorTypes';

/**
 * This component renders the asset corresponding to the given asset path.
 *
 * @assetPath - The path of the asset to render / preview.
 */
const AssetViewerPreview: React.FC<AssetProps> = ({ assetPath }) => {
  const displayAssetPath = assetPath || Constants.defaultAssetPath;
  return (
    <img
      alt="asset"
      crossOrigin="anonymous"
      src={toS3Path(displayAssetPath, !!assetPath)}
      width="150px"
      onError={e => {
        (e.target as any).onerror = null;
        (e.target as any).src = toS3Path(Constants.defaultAssetPath, false);
      }}
    />
  );
};

export default memo(AssetViewerPreview);
